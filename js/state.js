// State Management Module
const State = (function() {
  // Private state object
  const state = {
    // Authentication
    authToken: null,
    isAuthenticated: false,

    // Data
    currentData: null,

    // User Settings
    userSelections: {},

    // Timezone
    isTimezoneConfirmed: false,
    confirmedTimezone: null,
    detectedTimezone: null,

    // UI State
    currentLanguage: 'en',
    activeTab: 'submit-info',
    isLoading: false,
    timelineCollapsed: false,
    timeSlotsCollapsed: true,  // Default to collapsed

    // Cache
    lastDataFetch: null,
    dataCache: null
  };

  // Private listeners for state changes
  const listeners = {
    auth: [],
    data: [],
    timezone: [],
    ui: [],
    loading: []
  };

  // Initialize state from localStorage
  function initialize() {
    // Load auth state
    const storedToken = localStorage.getItem(Config.STORAGE.TOKEN);
    if (storedToken) {
      state.authToken = storedToken;
      state.isAuthenticated = true;
    }

    // Load timezone state
    state.isTimezoneConfirmed = localStorage.getItem(Config.STORAGE.TIMEZONE_CONFIRMED) === "true";
    state.confirmedTimezone = localStorage.getItem(Config.STORAGE.CONFIRMED_TIMEZONE);

    // Load user selections
    const storedSelections = localStorage.getItem(Config.STORAGE.TIME_SLOT_SELECTIONS);
    state.userSelections = storedSelections ? JSON.parse(storedSelections) : {};

    // Load language preference
    state.currentLanguage = localStorage.getItem(Config.STORAGE.SELECTED_LANGUAGE) || "en";

    // Load active tab
    state.activeTab = localStorage.getItem(Config.STORAGE.ACTIVE_TAB) || 'submit-info';

    // Load timeline collapsed state
    state.timelineCollapsed = localStorage.getItem('timelineCollapsed') === 'true';

    // Load time slots collapsed state (default to true if not set)
    const storedTimeSlotsState = localStorage.getItem('timeSlotsCollapsed');
    state.timeSlotsCollapsed = storedTimeSlotsState === null ? true : storedTimeSlotsState === 'true';
  }

  // Notify listeners of state changes
  function notifyListeners(type, data) {
    if (listeners[type]) {
      listeners[type].forEach(callback => callback(data));
    }
  }

  // Public API
  return {
    // Initialize state
    init: initialize,

    // Authentication methods
    setAuth(token, isAuthenticated) {
      state.authToken = token;
      state.isAuthenticated = isAuthenticated;

      if (token) {
        localStorage.setItem(Config.STORAGE.TOKEN, token);
      } else {
        localStorage.removeItem(Config.STORAGE.TOKEN);
      }

      notifyListeners('auth', { token, isAuthenticated });
    },

    getAuth() {
      return {
        token: state.authToken,
        isAuthenticated: state.isAuthenticated
      };
    },

    isAuthenticated() {
      return state.isAuthenticated;
    },

    setAuthenticated(authenticated, token = null) {
      state.isAuthenticated = authenticated;
      if (token) {
        state.authToken = token;
        localStorage.setItem(Config.STORAGE.TOKEN, token);
      }
      notifyListeners('auth', { token: state.authToken, isAuthenticated: authenticated });
    },

    // Data methods
    setData(data) {
      state.currentData = data;
      state.lastDataFetch = Date.now();
      state.dataCache = JSON.parse(JSON.stringify(data)); // Deep clone for cache
      notifyListeners('data', data);
    },

    getData() {
      return state.currentData;
    },

    getCachedData() {
      return state.dataCache;
    },

    isDataStale(maxAge = 60000) { // Default 1 minute
      if (!state.lastDataFetch) return true;
      return Date.now() - state.lastDataFetch > maxAge;
    },

    // Timezone methods
    setTimezone(confirmed, timezone, detected = null) {
      state.isTimezoneConfirmed = confirmed;
      state.confirmedTimezone = timezone;
      if (detected) state.detectedTimezone = detected;

      localStorage.setItem(Config.STORAGE.TIMEZONE_CONFIRMED, confirmed.toString());
      if (timezone) {
        localStorage.setItem(Config.STORAGE.CONFIRMED_TIMEZONE, timezone);
      }

      notifyListeners('timezone', { confirmed, timezone, detected });
    },

    getTimezone() {
      return {
        isConfirmed: state.isTimezoneConfirmed,
        confirmed: state.confirmedTimezone,
        detected: state.detectedTimezone
      };
    },

    // User selections methods
    setUserSelections(selections) {
      state.userSelections = selections;
      localStorage.setItem(Config.STORAGE.TIME_SLOT_SELECTIONS, JSON.stringify(selections));
    },

    getUserSelections() {
      return state.userSelections;
    },

    updateUserSelection(day, slotId, add = true) {
      if (!state.userSelections[day]) {
        state.userSelections[day] = [];
      }

      const index = state.userSelections[day].indexOf(slotId);
      if (add && index === -1) {
        state.userSelections[day].push(slotId);
      } else if (!add && index > -1) {
        state.userSelections[day].splice(index, 1);
        if (state.userSelections[day].length === 0) {
          delete state.userSelections[day];
        }
      }

      localStorage.setItem(Config.STORAGE.TIME_SLOT_SELECTIONS, JSON.stringify(state.userSelections));
    },

    clearUserSelections() {
      state.userSelections = {};
      localStorage.removeItem(Config.STORAGE.TIME_SLOT_SELECTIONS);
    },

    // UI State methods
    setLanguage(language) {
      state.currentLanguage = language;
      localStorage.setItem(Config.STORAGE.SELECTED_LANGUAGE, language);
      notifyListeners('ui', { type: 'language', value: language });
    },

    getLanguage() {
      return state.currentLanguage;
    },

    setActiveTab(tab) {
      state.activeTab = tab;
      localStorage.setItem(Config.STORAGE.ACTIVE_TAB, tab);
      notifyListeners('ui', { type: 'tab', value: tab });
    },

    getActiveTab() {
      return state.activeTab;
    },

    setLoading(isLoading) {
      state.isLoading = isLoading;
      notifyListeners('loading', isLoading);
    },

    isLoading() {
      return state.isLoading;
    },

    // Timeline collapsed state
    setTimelineCollapsed(collapsed) {
      state.timelineCollapsed = collapsed;
      localStorage.setItem('timelineCollapsed', collapsed.toString());
      notifyListeners('ui', { timelineCollapsed: collapsed });
    },

    isTimelineCollapsed() {
      return state.timelineCollapsed;
    },

    // Time slots collapsed state
    setTimeSlotsCollapsed(collapsed) {
      state.timeSlotsCollapsed = collapsed;
      localStorage.setItem('timeSlotsCollapsed', collapsed.toString());
      notifyListeners('ui', { timeSlotsCollapsed: collapsed });
    },

    isTimeSlotsCollapsed() {
      return state.timeSlotsCollapsed;
    },

    // Event subscription methods
    subscribe(type, callback) {
      if (listeners[type]) {
        listeners[type].push(callback);
        return () => {
          // Return unsubscribe function
          const index = listeners[type].indexOf(callback);
          if (index > -1) {
            listeners[type].splice(index, 1);
          }
        };
      }
    },

    // Debug method (remove in production)
    getState() {
      return JSON.parse(JSON.stringify(state)); // Deep clone to prevent direct mutation
    }
  };
})();

// Auto-initialize on load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => State.init());
  } else {
    State.init();
  }
}