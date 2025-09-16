// Utility Functions Module
const Utils = {
  // Timezone utilities
  timezone: {
    // Get proper timezone offset
    getOffset(timezone) {
      try {
        const now = new Date();
        const localDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
        const offsetMs = localDate.getTime() - utcDate.getTime();
        return Math.round(offsetMs / (1000 * 60 * 60));
      } catch (e) {
        console.error("Error calculating timezone offset:", e);
        return 0;
      }
    },

    // Convert offset to UTC string
    offsetToUTCString(offset) {
      if (offset === 0) return "UTC";
      const sign = offset >= 0 ? "+" : "";
      return `UTC${sign}${offset}`;
    },

    // Auto-detect user's timezone
    detectUserTimezone() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = this.getOffset(timezone);
        const utcString = this.offsetToUTCString(offset);

        return {
          iana: timezone,
          offset: offset,
          utc: utcString
        };
      } catch (e) {
        console.error("Timezone detection failed:", e);
        return {
          iana: "UTC",
          offset: 0,
          utc: "UTC"
        };
      }
    },

    // Convert member's local time slots to server time
    convertSlotsToServerTime(memberSlots, memberTimezone) {
      const serverTimeSlots = [];
      const timezoneOffset = parseInt(memberTimezone.replace("UTC", "")) || 0;
      const serverOffset = Config.SERVER.TIMEZONE_OFFSET;

      memberSlots.forEach(slotId => {
        const slot = Config.TIME_SLOTS.find(s => s.id === slotId);
        if (slot) {
          slot.hours.forEach(localHour => {
            // Convert from local time to server time
            let serverHour = localHour - (timezoneOffset - serverOffset);

            // Handle day wrap-around
            if (serverHour < 0) {
              serverHour += 24;
            } else if (serverHour >= 24) {
              serverHour -= 24;
            }

            // Find which server time slot this hour belongs to
            const serverSlot = Config.TIME_SLOTS.find(s => s.hours.includes(serverHour));
            if (serverSlot && !serverTimeSlots.includes(serverSlot.id)) {
              serverTimeSlots.push(serverSlot.id);
            }
          });
        }
      });

      return serverTimeSlots;
    }
  },

  // Validation utilities
  validation: {
    // Sanitize input to prevent XSS
    sanitizeInput(input) {
      if (typeof input !== 'string') return input;

      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;'
      };

      return input.replace(/[&<>"'/]/g, char => map[char]);
    },

    // Validate username
    isValidUsername(username) {
      if (!username || typeof username !== 'string') return false;
      const trimmed = username.trim();
      return trimmed.length >= 1 && trimmed.length <= 50;
    },

    // Validate car power
    isValidCarPower(carPower) {
      const power = parseInt(carPower);
      return !isNaN(power) && power > 0 && power <= 999999999;
    },

    // Validate tower level
    isValidTowerLevel(towerLevel) {
      const level = parseInt(towerLevel);
      return !isNaN(level) && level >= Config.UI.MIN_TOWER_LEVEL && level <= Config.UI.MAX_TOWER_LEVEL;
    },

    // Validate daily points
    isValidDailyPoints(points) {
      const dailyPoints = parseInt(points);
      return !isNaN(dailyPoints) && dailyPoints >= 0;
    },

    // Normalize username for comparison
    normalizeUsername(name) {
      return name.replace(/\s+/g, "").toLowerCase();
    }
  },

  // DOM utilities
  dom: {
    // Get element safely
    getElement(selector) {
      return document.querySelector(selector);
    },

    // Get all elements
    getElements(selector) {
      return document.querySelectorAll(selector);
    },

    // Show/hide element
    setVisible(element, visible) {
      if (typeof element === 'string') {
        element = this.getElement(element);
      }
      if (element) {
        element.style.display = visible ? '' : 'none';
      }
    },

    // Add/remove class
    toggleClass(element, className, add) {
      if (typeof element === 'string') {
        element = this.getElement(element);
      }
      if (element) {
        if (add) {
          element.classList.add(className);
        } else {
          element.classList.remove(className);
        }
      }
    },

    // Check if mobile
    isMobile() {
      return window.innerWidth < Config.UI.MOBILE_BREAKPOINT;
    },

    // Debounce function
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function
    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  },

  // Format utilities
  format: {
    // Format number with commas
    number(num) {
      return parseInt(num).toLocaleString();
    },

    // Format date
    date(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    // Format time
    time(date, timezone) {
      return date.toLocaleString("en-US", {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  },

  // Data utilities
  data: {
    // Deep clone object
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    // Check if object is empty
    isEmpty(obj) {
      return Object.keys(obj).length === 0;
    },

    // Sort members by car power
    sortMembersByPower(members) {
      return members.sort((a, b) => b.carPower - a.carPower);
    },

    // Find member by normalized username
    findMemberByUsername(members, username) {
      const normalized = Utils.validation.normalizeUsername(username);
      return members.find(member =>
        Utils.validation.normalizeUsername(member.username) === normalized
      );
    },

    // Get member index
    getMemberIndex(members, username) {
      const normalized = Utils.validation.normalizeUsername(username);
      return members.findIndex(member =>
        Utils.validation.normalizeUsername(member.username) === normalized
      );
    }
  },

  // Color utilities
  color: {
    // Get availability color based on count
    getAvailabilityColor(count) {
      const colors = Config.COLORS.AVAILABILITY;

      if (count === 0) return colors.NONE;
      if (count <= colors.CRITICAL.max) return colors.CRITICAL;
      if (count <= colors.LOW.max) return colors.LOW;
      if (count <= colors.MODERATE.max) return colors.MODERATE;
      if (count <= colors.GOOD.max) return colors.GOOD;
      return colors.EXCELLENT;
    }
  },

  // Storage utilities
  storage: {
    // Safe get from localStorage
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return defaultValue;
      }
    },

    // Safe set to localStorage
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Error writing to localStorage:', e);
        return false;
      }
    },

    // Remove from localStorage
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error('Error removing from localStorage:', e);
        return false;
      }
    }
  },

  // Error handling utilities
  error: {
    // Create error message
    getMessage(error) {
      if (typeof error === 'string') return error;
      if (error.message) return error.message;
      if (error.error) return error.error;
      return 'An unexpected error occurred';
    },

    // Log error with context
    log(context, error) {
      console.error(`[${context}]`, error);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}