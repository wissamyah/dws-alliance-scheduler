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

      // Handle 401/403 specifically - clear invalid authentication
      if (error.status === 401 || error.status === 403) {
        State.setAuth(null, false);
        error.message = "Authentication expired or invalid. Please log in again.";
        error.requiresAuth = true;
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
      // CRITICAL: Validate authentication BEFORE any processing
      const auth = State.getAuth();
      if (!auth.isAuthenticated || !auth.token) {
        const error = new Error("Authentication required to submit data");
        error.requiresAuth = true;
        throw error;
      }

      // Use request queue to ensure atomic operation
      const request = async () => {
        // Fetch LATEST data from GitHub
        const currentFileResponse = await fetch(buildUrl(), {
          headers: getHeaders(auth.token)
        });

        const currentFile = await processResponse(currentFileResponse);
        const latestSha = currentFile.sha;

        // Parse the LATEST content
        const content = atob(currentFile.content);
        const freshData = JSON.parse(content);

        if (!freshData || !freshData.members) {
          throw new Error("Failed to load current data from GitHub");
        }

        // Check if member exists in the FRESH data
        const existingIndex = Utils.data.getMemberIndex(freshData.members, memberData.username);

        if (existingIndex !== -1) {
          // Update existing member
          const existing = freshData.members[existingIndex];

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
            freshData.members[existingIndex] = memberData;
          }
        } else {
          // Add new member
          memberData.id = Date.now();
          freshData.members.push(memberData);
        }

        // Update timestamp
        freshData.lastUpdated = new Date().toISOString();

        // Save with the SAME SHA we just fetched (atomic operation)
        const newContent = btoa(JSON.stringify(freshData, null, 2));

        const response = await fetch(buildUrl(), {
          method: 'PUT',
          headers: getHeaders(auth.token),
          body: JSON.stringify({
            message: `Update member: ${memberData.username}`,
            content: newContent,
            sha: latestSha  // Use the SHA from THIS fetch
          })
        });

        const result = await processResponse(response);

        // DO NOT update State here - caller must reload from GitHub
        return { isUpdate: existingIndex !== -1, member: memberData };
      };

      return addToQueue(() => retryRequest(request));
    },

    // Delete member
    async deleteMember(memberId) {
      // CRITICAL: Validate authentication BEFORE any processing
      const auth = State.getAuth();
      if (!auth.isAuthenticated || !auth.token) {
        const error = new Error("Authentication required to delete data");
        error.requiresAuth = true;
        throw error;
      }

      // Use request queue to ensure atomic operation
      const request = async () => {
        // Fetch LATEST data from GitHub
        const currentFileResponse = await fetch(buildUrl(), {
          headers: getHeaders(auth.token)
        });

        const currentFile = await processResponse(currentFileResponse);
        const latestSha = currentFile.sha;

        // Parse the LATEST content
        const content = atob(currentFile.content);
        const freshData = JSON.parse(content);

        if (!freshData || !freshData.members) {
          throw new Error("Failed to load current data from GitHub");
        }

        const member = freshData.members.find(m => m.id === memberId);
        if (!member) {
          throw new Error("Member not found");
        }

        // Remove member from array
        freshData.members = freshData.members.filter(m => m.id !== memberId);

        // Update timestamp
        freshData.lastUpdated = new Date().toISOString();

        // Save with the SAME SHA we just fetched (atomic operation)
        const newContent = btoa(JSON.stringify(freshData, null, 2));

        const response = await fetch(buildUrl(), {
          method: 'PUT',
          headers: getHeaders(auth.token),
          body: JSON.stringify({
            message: `Remove member: ${member.username}`,
            content: newContent,
            sha: latestSha  // Use the SHA from THIS fetch
          })
        });

        const result = await processResponse(response);

        // DO NOT update State here - caller must reload from GitHub
        return member;
      };

      return addToQueue(() => retryRequest(request));
    },

    // Submit registration
    async submitRegistration(registrationData) {
      const token = Config.getRegistrationToken();

      if (!token) {
        const error = new Error("Registration token is required");
        error.requiresAuth = true;
        throw error;
      }

      // Use request queue to ensure atomic operation
      const request = async () => {
        // Fetch LATEST data from GitHub
        const currentFileResponse = await fetch(buildUrl(), {
          headers: getHeaders(token)
        });

        const currentFile = await processResponse(currentFileResponse);
        const latestSha = currentFile.sha;

        // Parse the LATEST content
        const content = atob(currentFile.content);
        const freshData = JSON.parse(content);

        if (!freshData) {
          throw new Error("Failed to load current data from GitHub");
        }

        // Initialize registrations array if it doesn't exist
        if (!freshData.registrations) {
          freshData.registrations = [];
        }

        // Add registration
        registrationData.id = Date.now();
        registrationData.submittedAt = new Date().toISOString();
        registrationData.status = 'pending';

        freshData.registrations.push(registrationData);

        // Update timestamp
        freshData.lastUpdated = new Date().toISOString();

        // Save with the SAME SHA we just fetched (atomic operation)
        const newContent = btoa(JSON.stringify(freshData, null, 2));

        const response = await fetch(buildUrl(), {
          method: 'PUT',
          headers: getHeaders(token),
          body: JSON.stringify({
            message: `New registration: ${registrationData.username}`,
            content: newContent,
            sha: latestSha  // Use the SHA from THIS fetch
          })
        });

        const result = await processResponse(response);

        // DO NOT update State here - caller must reload from GitHub
        return registrationData;
      };

      return addToQueue(() => retryRequest(request));
    },

    // Handle registration application (approve/decline)
    async handleApplication(appId, action) {
      // CRITICAL: Validate authentication BEFORE any processing
      const auth = State.getAuth();
      if (!auth.isAuthenticated || !auth.token) {
        const error = new Error("Authentication required to handle applications");
        error.requiresAuth = true;
        throw error;
      }

      // Use request queue to ensure atomic operation
      const request = async () => {
        // Fetch LATEST data from GitHub
        const currentFileResponse = await fetch(buildUrl(), {
          headers: getHeaders(auth.token)
        });

        const currentFile = await processResponse(currentFileResponse);
        const latestSha = currentFile.sha;

        // Parse the LATEST content
        const content = atob(currentFile.content);
        const freshData = JSON.parse(content);

        if (!freshData || !freshData.registrations) {
          throw new Error("No registrations found");
        }

        const appIndex = freshData.registrations.findIndex(app => app.id === appId);
        if (appIndex === -1) {
          throw new Error("Application not found");
        }

        // Update application status
        freshData.registrations[appIndex].status = action;
        freshData.registrations[appIndex].reviewedAt = new Date().toISOString();
        freshData.lastUpdated = new Date().toISOString();

        // Save with the SAME SHA we just fetched (atomic operation)
        const newContent = btoa(JSON.stringify(freshData, null, 2));

        const response = await fetch(buildUrl(), {
          method: 'PUT',
          headers: getHeaders(auth.token),
          body: JSON.stringify({
            message: `${action} registration application`,
            content: newContent,
            sha: latestSha  // Use the SHA from THIS fetch
          })
        });

        const result = await processResponse(response);

        // DO NOT update State here - caller must reload from GitHub
        return freshData.registrations[appIndex];
      };

      return addToQueue(() => retryRequest(request));
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