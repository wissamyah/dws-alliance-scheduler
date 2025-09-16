// UI Module - Handles all DOM operations and rendering
const UI = (function() {
  // Cache DOM elements
  const elements = {};
  let toastContainer = null;

  // Initialize DOM element cache
  function initializeElements() {
    // Cache commonly used elements
    elements.authSection = document.getElementById('authSection');
    elements.authStatus = document.getElementById('authStatus');
    elements.authControls = document.getElementById('authControls');
    elements.logoutBtn = document.getElementById('logoutBtn');
    elements.submitBtn = document.getElementById('submitBtn');
    elements.membersGrid = document.getElementById('membersGrid');
    elements.timelineView = document.getElementById('timelineView');
    elements.skeletonContainer = document.getElementById('skeletonContainer');
    elements.timezoneModal = document.getElementById('timezoneModal');
    elements.customModal = document.getElementById('customModal');
    elements.languageBtn = document.getElementById('languageBtn');
    elements.languageMenu = document.getElementById('languageMenu');
    elements.mobileSettingsPanel = document.getElementById('mobileSettingsPanel');
  }

  // Render methods
  const render = {
    // Update authentication UI
    authStatus() {
      const { isAuthenticated } = State.getAuth();

      if (elements.authStatus) {
        elements.authStatus.textContent = isAuthenticated ?
          t("authenticated") : t("notAuthenticated");
      }

      Utils.dom.setVisible(elements.authControls, !isAuthenticated);
      Utils.dom.setVisible(elements.logoutBtn, isAuthenticated);
      Utils.dom.toggleClass(elements.authSection, 'hidden', isAuthenticated);
    },

    // Render time slots
    timeSlots() {
      const timeSlotHeaders = document.getElementById('timeSlotHeaders');
      const timeSlotInputs = document.getElementById('timeSlotInputs');
      const userSelections = State.getUserSelections();
      const { isConfirmed } = State.getTimezone();
      const isMobile = Utils.dom.isMobile();

      if (isMobile) {
        timeSlotHeaders.innerHTML = this.buildMobileTimeSlots(userSelections, isConfirmed);
        timeSlotInputs.innerHTML = '';
      } else {
        timeSlotHeaders.innerHTML = '';
        timeSlotInputs.innerHTML = this.buildDesktopTimeSlots(userSelections, isConfirmed);
      }
    },

    // Build mobile time slots HTML
    buildMobileTimeSlots(selections, isConfirmed) {
      return `
        <div style="margin-bottom: 20px;">
          ${Config.DAYS.map(day => `
            <div style="margin-bottom: 25px;">
              <h4 style="color: #4a9eff; margin-bottom: 15px; text-align: center; font-size: 1.1em;">
                ${t(day)}
              </h4>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                ${Config.TIME_SLOTS.map(slot => {
                  const isActive = selections[day]?.includes(slot.id);
                  const disabledClass = !isConfirmed ? "disabled" : "";
                  const disabledAttr = !isConfirmed ? 'disabled="true"' : "";
                  return `
                    <div class="time-slot-btn ${isActive ? "active" : ""} ${disabledClass}"
                         data-day="${day}"
                         data-slot="${slot.id}"
                         onclick="App.toggleTimeSlot('${day}', '${slot.id}')"
                         ${disabledAttr}
                         style="padding: 15px 10px; min-height: 60px; font-size: 13px; font-weight: 600;">
                      ${slot.name}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // Build desktop time slots HTML
    buildDesktopTimeSlots(selections, isConfirmed) {
      return Config.DAYS.map(day => `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #4a9eff; margin-bottom: 15px; font-size: 1.1em;">
            ${t(day)}
          </h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            ${Config.TIME_SLOTS.map(slot => {
              const isActive = selections[day]?.includes(slot.id);
              const disabledClass = !isConfirmed ? "disabled" : "";
              const disabledAttr = !isConfirmed ? 'disabled="true"' : "";
              return `
                <div class="time-slot-btn ${isActive ? "active" : ""} ${disabledClass}"
                     data-day="${day}"
                     data-slot="${slot.id}"
                     onclick="App.toggleTimeSlot('${day}', '${slot.id}')"
                     ${disabledAttr}
                     style="padding: 12px 8px; min-height: 50px; font-size: 14px; font-weight: 600;">
                  ${slot.name}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('');
    },

    // Render members grid
    members() {
      const data = State.getData();
      if (!data || !data.members) return;

      const memberCount = data.members.length;
      const title = document.getElementById('allianceMembersTitle');
      if (title) {
        title.textContent = `${t("allianceMembers")} (${memberCount})`;
      }

      if (!elements.membersGrid) return;

      const sortedMembers = Utils.data.sortMembersByPower([...data.members]);
      const { isAuthenticated } = State.getAuth();

      elements.membersGrid.innerHTML = sortedMembers.map(member =>
        this.buildMemberCard(member, isAuthenticated)
      ).join('');
    },

    // Build member card HTML (using Components if available)
    buildMemberCard(member, isAuthenticated) {
      // Use Components module if available, otherwise fall back to inline HTML
      if (window.Components) {
        const card = Components.MemberCard.create(member, isAuthenticated);
        return card.outerHTML || card;
      }

      // Fallback implementation
      const availabilityHTML = Object.entries(member.availability || {})
        .map(([day, slots]) => {
          const slotNames = slots.map(slotId => {
            const slot = Config.TIME_SLOTS.find(s => s.id === slotId);
            return slot ? slot.name : slotId;
          });
          return `<div><strong>${t(day)}:</strong> ${slotNames.join(", ")}</div>`;
        })
        .join('');

      return `
        <div class="member-card" data-username="${member.username.toLowerCase()}">
          <h3>${Utils.validation.sanitizeInput(member.username)}</h3>
          <div class="stats">
            <span class="power">${t("power")}: ${Utils.format.number(member.carPower)}</span> |
            <span class="tower">${t("tower")}: ${member.towerLevel}</span>
          </div>
          <div class="stats">${t("timezone")}: ${member.timezone}</div>
          <button class="timeslots-toggle" onclick="App.toggleMemberTimeslots(${member.id})"
                  data-member-id="${member.id}">
            <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <div class="time-slots collapsed" data-member-id="${member.id}">
            ${availabilityHTML}
          </div>
          ${isAuthenticated ? `
            <button class="delete-btn" onclick="App.deleteMember(${member.id})">
              <svg width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : ''}
        </div>
      `;
    },

    // Render timeline
    timeline() {
      const data = State.getData();
      if (!data || !elements.timelineView) return;

      const availability = this.calculateAvailability(data.members);
      const isMobile = Utils.dom.isMobile();

      elements.timelineView.innerHTML = isMobile ?
        this.buildMobileTimeline(availability) :
        this.buildDesktopTimeline(availability);
    },

    // Calculate member availability
    calculateAvailability(members) {
      const availability = {};

      Config.DAYS.forEach(day => {
        availability[day] = {};
        Config.TIME_SLOTS.forEach(slot => {
          availability[day][slot.id] = 0;

          members.forEach(member => {
            if (member.availability[day]) {
              const serverSlots = Utils.timezone.convertSlotsToServerTime(
                member.availability[day],
                member.timezone
              );
              if (serverSlots.includes(slot.id)) {
                availability[day][slot.id]++;
              }
            }
          });
        });
      });

      return availability;
    },

    // Build mobile timeline HTML
    buildMobileTimeline(availability) {
      return `
        <div style="margin-top: 20px;">
          <p style="text-align: center; color: #888; margin-bottom: 20px;">
            ${t("memberAvailabilityScale")}
          </p>
          ${Config.DAYS.map(day => {
            const maxCount = Math.max(...Object.values(availability[day]));
            const bestSlots = Config.TIME_SLOTS.filter(slot =>
              availability[day][slot.id] === maxCount && maxCount > 0
            );
            return `
              <div style="background: #161625; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                <h4 style="color: #4a9eff; text-transform: capitalize; margin-bottom: 10px;">
                  ${t(day)}
                </h4>
                ${bestSlots.length > 0 ? `
                  <p style="color: #44ff44;">${t("bestServerTime", {
                    slots: bestSlots.map(s => s.name).join(", ")
                  })}</p>
                  <p style="color: #888; font-size: 14px;">
                    ${t("membersAvailable", { count: maxCount })}
                  </p>
                ` : `
                  <p style="color: #888;">${t("noMembersAvailable")}</p>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    // Build desktop timeline HTML
    buildDesktopTimeline(availability) {
      return `
        <div style="margin-top: 20px; overflow-x: auto;">
          <div style="text-align: center; color: #888; margin-bottom: 20px; font-size: 14px;">
            <p style="margin-bottom: 10px;">${t("memberAvailabilityScale")}</p>
            <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
              ${this.buildAvailabilityLegend()}
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="padding: 10px; text-align: left;">Day</th>
              ${Config.TIME_SLOTS.map(slot =>
                `<th style="padding: 5px; text-align: center; font-size: 12px; color: #4a9eff;">
                  ${slot.name}
                </th>`
              ).join('')}
            </tr>
            ${Config.DAYS.map(day => `
              <tr>
                <td style="padding: 10px; text-transform: capitalize; font-weight: 500; color: #888;">
                  ${t(day)}
                </td>
                ${Config.TIME_SLOTS.map(slot => {
                  const count = availability[day][slot.id];
                  const colors = Utils.color.getAvailabilityColor(count);
                  return `
                    <td style="
                      background: ${colors.bg};
                      color: ${colors.text};
                      padding: 10px;
                      text-align: center;
                      border: 1px solid #333;
                      font-size: 12px;
                      font-weight: 600;
                    ">
                      ${count}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    },

    // Build availability legend
    buildAvailabilityLegend() {
      const labels = [
        { key: 'CRITICAL', label: 'critical', range: '0-5' },
        { key: 'LOW', label: 'low', range: '6-9' },
        { key: 'MODERATE', label: 'moderate', range: '10-12' },
        { key: 'GOOD', label: 'good', range: '13-15' },
        { key: 'EXCELLENT', label: 'excellent', range: '16+' }
      ];

      return labels.map(({ key, label, range }) => {
        const colors = Config.COLORS.AVAILABILITY[key];
        return `
          <span style="background: ${colors.bg}; color: ${colors.text};
                       padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${range}: ${t(label)}
          </span>
        `;
      }).join('');
    },

    // Update timezone UI
    timezoneUI() {
      const timeLocked = document.getElementById('timezoneLocked');
      const timeStatus = document.getElementById('timezoneStatus');
      const manualGroup = document.getElementById('manualTimezoneGroup');
      const { isConfirmed, confirmed } = State.getTimezone();

      if (isConfirmed && confirmed) {
        Utils.dom.setVisible(timeLocked, false);
        Utils.dom.setVisible(timeStatus, true);
        Utils.dom.setVisible(manualGroup, false);

        const confirmedText = document.getElementById('confirmedTimezoneText');
        if (confirmedText) {
          confirmedText.textContent = t("usingTimezone", { timezone: confirmed });
        }

        this.enableTimeSlotSelection();
      } else {
        Utils.dom.setVisible(timeLocked, true);
        Utils.dom.setVisible(timeStatus, false);
        this.disableTimeSlotSelection();
      }
    },

    // Enable time slot selection
    enableTimeSlotSelection() {
      document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.remove('disabled');
        btn.removeAttribute('disabled');
      });
      if (elements.submitBtn) {
        elements.submitBtn.disabled = false;
      }
    },

    // Disable time slot selection
    disableTimeSlotSelection() {
      document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.add('disabled');
        btn.setAttribute('disabled', 'true');
      });
      if (elements.submitBtn) {
        elements.submitBtn.disabled = true;
      }
    }
  };

  // Toast notification system
  const toast = {
    show(text, type = 'info') {
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
      }

      const toastEl = document.createElement('div');
      toastEl.className = `toast ${type}`;

      const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
      };

      toastEl.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${Utils.validation.sanitizeInput(text)}</div>
      `;

      toastContainer.appendChild(toastEl);

      // Trigger animation
      setTimeout(() => toastEl.classList.add('show'), 10);

      // Auto-remove
      setTimeout(() => {
        toastEl.classList.add('hide');
        setTimeout(() => {
          if (toastEl.parentNode) {
            toastEl.parentNode.removeChild(toastEl);
          }
        }, Config.TIMERS.TOAST_ANIMATION);
      }, Config.TIMERS.TOAST_DURATION);
    }
  };

  // Loading indicator
  const loading = {
    show(show = true) {
      const mainContainer = document.querySelector('.container:not(.skeleton-container .container)');

      if (show) {
        Utils.dom.toggleClass(elements.skeletonContainer, 'show', true);
        if (mainContainer) {
          mainContainer.style.display = 'none';
        }
      } else {
        Utils.dom.toggleClass(elements.skeletonContainer, 'show', false);
        if (mainContainer) {
          mainContainer.style.display = 'block';
        }
      }
    }
  };

  // Modal system
  const modal = {
    // Show custom alert
    alert(title, message) {
      return this.show(title, message, 'alert');
    },

    // Show custom confirm
    confirm(title, message) {
      return this.show(title, message, 'confirm');
    },

    // Show custom prompt
    prompt(title, message, defaultValue = '') {
      return this.show(title, message, 'prompt', defaultValue);
    },

    // Generic show modal
    show(title, message, type, defaultValue = '') {
      return new Promise((resolve) => {
        const titleEl = document.getElementById('customModalTitle');
        const messageEl = document.getElementById('customModalMessage');
        const inputContainer = document.getElementById('customModalInput');
        const buttonsContainer = document.getElementById('customModalButtons');
        const inputField = document.getElementById('customModalInputField');

        titleEl.textContent = title;
        messageEl.textContent = message;

        if (type === 'prompt') {
          inputContainer.style.display = 'block';
          inputField.value = defaultValue;
          buttonsContainer.innerHTML = `
            <button class="btn btn-success" onclick="UI.modal.resolve('input')">✅ OK</button>
            <button class="btn" onclick="UI.modal.resolve(null)">❌ Cancel</button>
          `;
        } else if (type === 'confirm') {
          inputContainer.style.display = 'none';
          buttonsContainer.innerHTML = `
            <button class="btn btn-success" onclick="UI.modal.resolve(true)">✅ Yes</button>
            <button class="btn" onclick="UI.modal.resolve(false)">❌ Cancel</button>
          `;
        } else {
          inputContainer.style.display = 'none';
          buttonsContainer.innerHTML = `
            <button class="btn btn-primary" onclick="UI.modal.resolve()">✅ OK</button>
          `;
        }

        elements.customModal.classList.add('active');

        // Store resolver
        elements.customModal._resolver = resolve;
        elements.customModal._inputField = inputField;

        // Handle outside clicks
        elements.customModal.onclick = (e) => {
          if (e.target === elements.customModal) {
            this.resolve(type === 'confirm' ? false : null);
          }
        };

        // Focus input for prompts
        if (type === 'prompt') {
          setTimeout(() => {
            inputField.focus();
            inputField.select();
          }, Config.TIMERS.MODAL_ANIMATION);

          // Handle Enter/Escape keys
          inputField.onkeydown = (e) => {
            if (e.key === 'Enter') {
              this.resolve('input');
            } else if (e.key === 'Escape') {
              this.resolve(null);
            }
          };
        }
      });
    },

    // Resolve modal
    resolve(result) {
      const modal = elements.customModal;

      if (result === 'input' && modal._inputField) {
        result = modal._inputField.value;
      }

      modal.classList.remove('active');
      modal.onclick = null;

      if (modal._inputField) {
        modal._inputField.onkeydown = null;
      }

      if (modal._resolver) {
        modal._resolver(result);
        modal._resolver = null;
        modal._inputField = null;
      }
    }
  };

  // Public API
  return {
    init() {
      initializeElements();
    },

    render,
    toast,
    loading,
    modal,

    // Update all UI components
    updateAll() {
      render.authStatus();
      render.timezoneUI();
      render.timeSlots();
      render.members();
      render.timeline();
    }
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}

// Make modal resolver accessible globally for onclick handlers
window.UI = UI;