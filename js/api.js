// API Service Module
const API = (function() {
  // Private variables
  let requestQueue = [];
  let isProcessing = false;

  // API endpoints
  const GITHUB_API_BASE = 'https://api.github.com';

  // Build API URL
  function buildUrl() {
    const { OWNER, NAME, DATA_FILE } = Config.REPO;
    return `${GITHUB_API_BASE}/repos/${OWNER}/${NAME}/contents/${DATA_FILE}`;
  }

  // Get headers for API requests
  function getHeaders(token) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    return headers;
  }

  // Retry logic with exponential backoff
  async function retryRequest(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on auth errors
        if (error.status === 401 || error.status === 403) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  // Process API response
  async function processResponse(response) {
    if (!response.ok) {
      const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
      error.status = response.status;

      try {
        const errorData = await response.json();
        error.details = errorData;
      } catch (e) {
        // Ignore JSON parsing errors for error response
      }

      throw error;
    }

    return response.json();
  }

  // Queue management for API requests
  async function addToQueue(request) {
    return new Promise((resolve, reject) => {
      requestQueue.push({ request, resolve, reject });
      processQueue();
    });
  }

  async function processQueue() {
    if (isProcessing || requestQueue.length === 0) {
      return;
    }

    isProcessing = true;
    const { request, resolve, reject } = requestQueue.shift();

    try {
      const result = await request();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      isProcessing = false;
      // Process next item in queue
      setTimeout(processQueue, 100); // Small delay between requests
    }
  }

  // Public API methods
  return {
    // Load data from GitHub
    async loadData(useCache = true) {
      // Check cache first
      if (useCache && !State.isDataStale()) {
        const cachedData = State.getCachedData();
        if (cachedData) {
          return cachedData;
        }
      }

      const request = async () => {
        const response = await fetch(buildUrl());
        const file = await processResponse(response);

        const content = atob(file.content);
        const data = JSON.parse(content);
        data.sha = file.sha;

        // Update state with fresh data
        State.setData(data);

        return data;
      };

      return retryRequest(request);
    },

    // Save data to GitHub
    async saveData(data, message = "Update alliance data") {
      const auth = State.getAuth();

      if (!auth.isAuthenticated || !auth.token) {
        throw new Error("Authentication required to save data");
      }

      const request = async () => {
        // Prepare data for saving
        const saveData = { ...data };
        saveData.lastUpdated = new Date().toISOString();

        // Don't include sha in the content
        const sha = saveData.sha;
        delete saveData.sha;

        const content = btoa(JSON.stringify(saveData, null, 2));

        const response = await fetch(buildUrl(), {
          method: 'PUT',
          headers: getHeaders(auth.token),
          body: JSON.stringify({
            message,
            content,
            sha
          })
        });

        const result = await processResponse(response);

        // Update sha for next save
        data.sha = result.content.sha;

        // Update state with saved data
        State.setData(data);

        return result;
      };

      return addToQueue(() => retryRequest(request));
    },

    // Save registration data (using registration token)
    async saveRegistrationData(data, message = "Add new registration application") {
      const token = State.getAuth().token || Config.getRegistrationToken();

      if (!token) {
        throw new Error("Registration token is required");
      }

      const request = async () => {
        // Prepare data for saving
        const saveData = { ...data };
        saveData.lastUpdated = new Date().toISOString();

        // Don't include sha in the content
        const sha = saveData.sha;
        delete saveData.sha;

        const content = btoa(JSON.stringify(saveData, null, 2));

        const response = await fetch(buildUrl(), {
          method: 'PUT',
          headers: getHeaders(token),
          body: JSON.stringify({
            message,
            content,
            sha
          })
        });

        const result = await processResponse(response);

        // Update sha for next save
        data.sha = result.content.sha;

        // Update state with saved data
        State.setData(data);

        return result;
      };

      return addToQueue(() => retryRequest(request));
    },

    // Test authentication
    async testAuth(token) {
      const request = async () => {
        const response = await fetch(`${GITHUB_API_BASE}/user`, {
          headers: getHeaders(token)
        });

        if (response.status === 401) {
          throw new Error("Invalid token");
        }

        return processResponse(response);
      };

      return retryRequest(request, 1); // Only try once for auth test
    },

    // Submit member info
    async submitMemberInfo(memberData) {
      const data = State.getData();

      if (!data) {
        throw new Error("No data loaded");
      }

      // Check if member exists
      const existingIndex = Utils.data.getMemberIndex(data.members, memberData.username);

      if (existingIndex !== -1) {
        // Update existing member
        const existing = data.members[existingIndex];

        // Smart update logic
        const hasTimeSlotsSelected = Object.keys(memberData.availability || {}).length > 0;

        if (!hasTimeSlotsSelected) {
          // Quick update mode
          if (memberData.carPower) existing.carPower = memberData.carPower;
          if (memberData.towerLevel) existing.towerLevel = memberData.towerLevel;
        } else {
          // Full update mode
          memberData.id = existing.id;
          memberData.username = existing.username; // Keep original format
          if (!memberData.carPower) memberData.carPower = existing.carPower;
          if (!memberData.towerLevel) memberData.towerLevel = existing.towerLevel;
          data.members[existingIndex] = memberData;
        }
      } else {
        // Add new member
        memberData.id = Date.now();
        data.members.push(memberData);
      }

      // Save to GitHub
      await this.saveData(data);

      return { isUpdate: existingIndex !== -1, member: memberData };
    },

    // Delete member
    async deleteMember(memberId) {
      const data = State.getData();

      if (!data) {
        throw new Error("No data loaded");
      }

      const member = data.members.find(m => m.id === memberId);
      if (!member) {
        throw new Error("Member not found");
      }

      // Remove member from array
      data.members = data.members.filter(m => m.id !== memberId);

      // Save to GitHub
      await this.saveData(data, `Remove member: ${member.username}`);

      return member;
    },

    // Submit registration
    async submitRegistration(registrationData) {
      const data = State.getData();

      if (!data) {
        throw new Error("No data loaded");
      }

      // Initialize registrations array if it doesn't exist
      if (!data.registrations) {
        data.registrations = [];
      }

      // Add registration
      registrationData.id = Date.now();
      registrationData.submittedAt = new Date().toISOString();
      registrationData.status = 'pending';

      data.registrations.push(registrationData);

      // Save using registration token
      await this.saveRegistrationData(data);

      return registrationData;
    },

    // Handle registration application (approve/decline)
    async handleApplication(appId, action) {
      const data = State.getData();

      if (!data || !data.registrations) {
        throw new Error("No registrations found");
      }

      const appIndex = data.registrations.findIndex(app => app.id === appId);
      if (appIndex === -1) {
        throw new Error("Application not found");
      }

      // Update application status
      data.registrations[appIndex].status = action;
      data.registrations[appIndex].reviewedAt = new Date().toISOString();

      // Save using registration token
      await this.saveRegistrationData(data, `${action} registration application`);

      return data.registrations[appIndex];
    },

    // Check API rate limit
    async checkRateLimit(token) {
      const request = async () => {
        const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
          headers: getHeaders(token)
        });

        return processResponse(response);
      };

      return retryRequest(request, 1);
    },

    // Clear request queue
    clearQueue() {
      requestQueue = [];
    },

    // Get queue length
    getQueueLength() {
      return requestQueue.length;
    }
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}