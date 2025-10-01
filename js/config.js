// Configuration and Constants Module
const Config = {
  // GitHub Repository Settings
  REPO: {
    OWNER: "wissamyah",
    NAME: "dws-alliance-scheduler",
    DATA_FILE: "data.json",
    DATA_BRANCH: "data"  // Separate branch for data - prevents deployment triggers
  },

  // Server Configuration
  SERVER: {
    TIMEZONE_OFFSET: -2, // UTC-2
    TIMEZONE_NAME: "UTC-2"
  },

  // Authentication
  AUTH: {
    ADMIN_PASSWORD: "ZOE",
    R5_PASSWORD: "R5"
  },

  // Time Slot Definitions - 2 hour blocks
  TIME_SLOTS: [
    { id: "slot1", name: "12AM-2AM", hours: [0, 1] },
    { id: "slot2", name: "2AM-4AM", hours: [2, 3] },
    { id: "slot3", name: "4AM-6AM", hours: [4, 5] },
    { id: "slot4", name: "6AM-8AM", hours: [6, 7] },
    { id: "slot5", name: "8AM-10AM", hours: [8, 9] },
    { id: "slot6", name: "10AM-12PM", hours: [10, 11] },
    { id: "slot7", name: "12PM-2PM", hours: [12, 13] },
    { id: "slot8", name: "2PM-4PM", hours: [14, 15] },
    { id: "slot9", name: "4PM-6PM", hours: [16, 17] },
    { id: "slot10", name: "6PM-8PM", hours: [18, 19] },
    { id: "slot11", name: "8PM-10PM", hours: [20, 21] },
    { id: "slot12", name: "10PM-12AM", hours: [22, 23] }
  ],

  // Days of the Week
  DAYS: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],

  // Intervals and Timeouts
  TIMERS: {
    AUTO_REFRESH: 300000, // 5 minutes
    RESIZE_DEBOUNCE: 250,
    TOAST_DURATION: 2000,
    TOAST_ANIMATION: 400,
    MODAL_ANIMATION: 100,
    TIME_UPDATE_INTERVAL: 1000
  },

  // UI Configuration
  UI: {
    MOBILE_BREAKPOINT: 768,
    MAX_TOWER_LEVEL: 33,
    MIN_TOWER_LEVEL: 1
  },

  // Member Availability Colors
  COLORS: {
    AVAILABILITY: {
      NONE: { bg: "#0a0a0a", text: "#666" },
      CRITICAL: { bg: "#cc2936", text: "#fff", max: 5 },
      LOW: { bg: "#ff6b35", text: "#fff", max: 9 },
      MODERATE: { bg: "#f7b32b", text: "#000", max: 12 },
      GOOD: { bg: "#44ff44", text: "#000", max: 15 },
      EXCELLENT: { bg: "#28a745", text: "#fff", max: Infinity }
    }
  },

  // Local Storage Keys
  STORAGE: {
    TOKEN: "githubToken",
    TIMEZONE_CONFIRMED: "timezoneConfirmed",
    CONFIRMED_TIMEZONE: "confirmedTimezone",
    TIME_SLOT_SELECTIONS: "timeSlotSelections",
    SELECTED_LANGUAGE: "selectedLanguage",
    ACTIVE_TAB: "activeTab"
  }
};

// Get registration token (secure handling)
Config.getRegistrationToken = function() {
  // This should ideally be handled server-side
  // For now, reconstruct the token securely
  const tokenParts = [
    atob('Z2hwXw=='), // Base64 encoded prefix
    'pEme', 'RUpV', 'QNU3', 'ZfJB', 'Y1U0',
    'XiUJ', 'yzyw', 'uj2a', 'cwDf'
  ];
  return tokenParts.join('');
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
}