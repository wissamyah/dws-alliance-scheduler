// Reusable Components Module
const Components = (function() {

  // Member Card Component
  const MemberCard = {
    create(member, isAuthenticated) {
      const card = document.createElement('div');
      card.className = 'member-card';
      card.dataset.username = member.username.toLowerCase();
      card.dataset.memberId = member.id;

      card.innerHTML = `
        <h3>${Utils.validation.sanitizeInput(member.username)}</h3>
        ${this.renderStats(member)}
        ${this.renderTimezone(member)}
        ${this.renderToggleButton(member.id)}
        ${this.renderTimeSlots(member)}
        ${isAuthenticated ? this.renderDeleteButton(member.id) : ''}
      `;

      return card;
    },

    renderStats(member) {
      return `
        <div class="stats">
          <span class="power">${t("power")}: ${Utils.format.number(member.carPower)}</span> |
          <span class="tower">${t("tower")}: ${member.towerLevel}</span>
        </div>
      `;
    },

    renderTimezone(member) {
      return `<div class="stats">${t("timezone")}: ${member.timezone}</div>`;
    },

    renderToggleButton(memberId) {
      return `
        <button class="timeslots-toggle" onclick="App.toggleMemberTimeslots(${memberId})"
                data-member-id="${memberId}">
          <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      `;
    },

    renderTimeSlots(member) {
      const slotsHTML = Object.entries(member.availability || {})
        .map(([day, slots]) => {
          const slotNames = slots.map(slotId => {
            const slot = Config.TIME_SLOTS.find(s => s.id === slotId);
            return slot ? slot.name : slotId;
          });
          return `<div><strong>${t(day)}:</strong> ${slotNames.join(", ")}</div>`;
        })
        .join('');

      return `
        <div class="time-slots collapsed" data-member-id="${member.id}">
          ${slotsHTML}
        </div>
      `;
    },

    renderDeleteButton(memberId) {
      return `
        <button class="delete-btn" onclick="App.deleteMember(${memberId})">
          <svg width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
    }
  };

  // Time Slot Button Component
  const TimeSlotButton = {
    create(day, slot, isActive, isDisabled) {
      const btn = document.createElement('div');
      btn.className = `time-slot-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
      btn.dataset.day = day;
      btn.dataset.slot = slot.id;
      btn.onclick = () => App.toggleTimeSlot(day, slot.id);

      if (isDisabled) {
        btn.setAttribute('disabled', 'true');
      }

      btn.style.cssText = Utils.dom.isMobile() ?
        'padding: 15px 10px; min-height: 60px; font-size: 13px; font-weight: 600;' :
        'padding: 12px 8px; min-height: 50px; font-size: 14px; font-weight: 600;';

      btn.textContent = slot.name;

      return btn;
    }
  };

  // Day Schedule Component
  const DaySchedule = {
    create(day, userSelections, isConfirmed) {
      const container = document.createElement('div');
      container.style.marginBottom = '25px';

      const title = document.createElement('h4');
      title.style.cssText = 'color: #4a9eff; margin-bottom: 15px; text-align: center; font-size: 1.1em;';
      title.textContent = t(day);

      const grid = document.createElement('div');
      grid.style.cssText = Utils.dom.isMobile() ?
        'display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;' :
        'display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;';

      Config.TIME_SLOTS.forEach(slot => {
        const isActive = userSelections[day]?.includes(slot.id);
        const btn = TimeSlotButton.create(day, slot, isActive, !isConfirmed);
        grid.appendChild(btn);
      });

      container.appendChild(title);
      container.appendChild(grid);

      return container;
    }
  };

  // Application Card Component
  const ApplicationCard = {
    create(app) {
      return `
        <div class="member-card" style="position: relative;">
          ${this.renderHeader(app)}
          ${this.renderStats(app)}
          ${this.renderDetails(app)}
          ${this.renderMeta(app)}
          ${this.renderActions(app)}
        </div>
      `;
    },

    renderHeader(app) {
      return `<h3>${Utils.validation.sanitizeInput(app.username)}</h3>`;
    },

    renderStats(app) {
      return `
        <div class="stats">
          <span class="power">Power: ${Utils.format.number(app.carPower)}</span> |
          <span class="tower">Tower: ${app.towerLevel}</span>
        </div>
        <div class="stats">Daily VS Points: ${Utils.format.number(app.dailyPoints)}</div>
      `;
    },

    renderDetails(app) {
      return `
        <div style="background: rgba(10, 10, 10, 0.6); padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px;">
          <p><strong>Previous Alliances:</strong> ${app.exAlliances || 'None'}</p>
          <p><strong>Reason for leaving:</strong> ${app.whyLeft || 'N/A'}</p>
          <p><strong>Why join TDC:</strong> ${app.whyJoin}</p>
          <p><strong>Motivation:</strong> ${app.motivation}</p>
        </div>
      `;
    },

    renderMeta(app) {
      return `
        <div class="stats" style="font-size: 11px; color: #888;">
          Submitted: ${Utils.format.date(app.submittedAt)}
        </div>
      `;
    },

    renderActions(app) {
      return `
        <div style="margin-top: 15px; display: flex; gap: 10px;">
          <button class="btn btn-success" style="flex: 1; padding: 8px 12px; font-size: 12px;"
                  onclick="App.handleApplicationAction(${app.id}, 'approved')">
            ✅ Approve
          </button>
          <button class="btn btn-danger" style="flex: 1; padding: 8px 12px; font-size: 12px;"
                  onclick="App.handleApplicationAction(${app.id}, 'declined')">
            ❌ Decline
          </button>
        </div>
      `;
    }
  };

  // Form Field Component
  const FormField = {
    create(options) {
      const {
        id,
        label,
        type = 'text',
        placeholder = '',
        required = false,
        value = '',
        min = null,
        max = null
      } = options;

      const container = document.createElement('div');
      container.className = 'form-group';

      const labelEl = document.createElement('label');
      labelEl.setAttribute('for', id);
      labelEl.setAttribute('data-translate', label);
      labelEl.textContent = t(label);
      if (required) {
        labelEl.innerHTML += ' <span style="color: #ff6b35;">*</span>';
      }

      let input;
      if (type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else {
        input = document.createElement('input');
        input.type = type;
        if (min !== null) input.min = min;
        if (max !== null) input.max = max;
      }

      input.id = id;
      input.name = id;
      input.placeholder = t(placeholder);
      input.value = value;
      if (required) input.required = true;

      container.appendChild(labelEl);
      container.appendChild(input);

      return container;
    }
  };

  // Button Component
  const Button = {
    create(options) {
      const {
        text,
        onClick,
        type = 'button',
        variant = 'primary',
        icon = null,
        disabled = false
      } = options;

      const btn = document.createElement('button');
      btn.className = `btn btn-${variant}`;
      btn.type = type;
      btn.disabled = disabled;

      if (onClick) {
        btn.onclick = onClick;
      }

      let content = '';
      if (icon) {
        content += `<span style="margin-right: 5px;">${icon}</span>`;
      }
      content += t(text);

      btn.innerHTML = content;

      return btn;
    }
  };

  // Loading Skeleton Component
  const Skeleton = {
    card() {
      return `
        <div class="skeleton-card">
          <div class="skeleton-line" style="width: 60%; height: 20px;"></div>
          <div class="skeleton-line" style="width: 80%; height: 14px; margin-top: 10px;"></div>
          <div class="skeleton-line" style="width: 70%; height: 14px; margin-top: 8px;"></div>
        </div>
      `;
    },

    grid(count = 6) {
      return Array(count).fill(this.card()).join('');
    }
  };

  // Timeline Cell Component
  const TimelineCell = {
    create(count, slot) {
      const colors = Utils.color.getAvailabilityColor(count);

      const cell = document.createElement('td');
      cell.style.cssText = `
        background: ${colors.bg};
        color: ${colors.text};
        padding: 10px;
        text-align: center;
        border: 1px solid #333;
        font-size: 12px;
        font-weight: 600;
      `;

      cell.textContent = count;
      cell.title = `${slot.name}: ${count} members available`;

      return cell;
    }
  };

  // Tab Component
  const Tab = {
    create(tabs, activeTab) {
      const container = document.createElement('div');
      container.className = 'tabs-container';

      const nav = document.createElement('div');
      nav.className = 'tabs-nav';

      tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${tab.id === activeTab ? 'active' : ''}`;
        btn.dataset.tab = tab.id;
        btn.onclick = () => App.switchTab(tab.id);
        btn.innerHTML = `
          ${tab.icon ? `<span>${tab.icon}</span>` : ''}
          <span data-translate="${tab.label}">${t(tab.label)}</span>
        `;
        nav.appendChild(btn);
      });

      container.appendChild(nav);

      return container;
    }
  };

  // Public API
  return {
    MemberCard,
    TimeSlotButton,
    DaySchedule,
    ApplicationCard,
    FormField,
    Button,
    Skeleton,
    TimelineCell,
    Tab
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Components;
}

// Make components globally available
window.Components = Components;