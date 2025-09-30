// Main Application Module
const App = (function() {
  // Private variables
  let timeUpdateInterval = null;
  let autoRefreshInterval = null;
  let resizeTimeout = null;

  // Initialize application
  async function initialize() {
    try {
      // Initialize modules
      State.init();
      UI.init();

      // Set up event listeners
      setupEventListeners();

      // Set up state subscriptions
      setupStateSubscriptions();

      // Initialize language
      initializeLanguage();

      // Initialize tabs
      initializeTabs();

      // Initialize collapsible states
      initializeTimelineState();
      initializeTimeSlotsState();

      // Initialize floating auth button
      updateFloatingAuthButton();

      // Hide notification after 5 seconds
      setTimeout(() => {
        const notification = document.getElementById('fabNotification');
        if (notification && !State.isAuthenticated()) {
          notification.classList.add('hidden');
        }
      }, 5000);

      // Check timezone
      checkTimezone();

      // Load initial data
      await loadInitialData();

      // Start auto-refresh
      startAutoRefresh();

      // Handle window resize
      setupResizeHandler();

    } catch (error) {
      Utils.error.log('App initialization', error);
      UI.toast.show(t('errorLoadingData', { error: Utils.error.getMessage(error) }), 'error');
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Authentication
    const authenticateBtn = document.querySelector('[onclick="authenticate()"]');
    if (authenticateBtn) {
      authenticateBtn.onclick = async () => await authenticate();
    }

    // Language dropdown
    const langBtn = document.getElementById('languageBtn');
    if (langBtn) {
      langBtn.addEventListener('click', toggleLanguageMenu);
    }

    document.querySelectorAll('.language-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        if (lang) changeLanguage(lang);
      });
    });

    // Member search
    const searchInput = document.getElementById('memberSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.dom.debounce(filterMembers, 300));
    }

    // Form submission
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.onclick = async () => await submitMemberInfo();
    }

    // Registration form
    const regForm = document.getElementById('registrationForm');
    if (regForm) {
      regForm.onsubmit = async (e) => await handleRegistrationSubmit(e);
    }

    // Timezone modal buttons
    const confirmTimezoneBtn = document.querySelector('[onclick="confirmTimezone()"]');
    if (confirmTimezoneBtn) {
      confirmTimezoneBtn.onclick = async () => await confirmTimezone();
    }

    const changeTimezoneBtn = document.querySelector('[onclick="changeTimezone()"]');
    if (changeTimezoneBtn) {
      changeTimezoneBtn.onclick = async () => await changeTimezone();
    }

    // Manual timezone select
    const timezoneSelect = document.getElementById('timezone');
    if (timezoneSelect) {
      timezoneSelect.addEventListener('change', handleManualTimezoneChange);
    }
  }

  // Set up state subscriptions
  function setupStateSubscriptions() {
    // Subscribe to auth changes
    State.subscribe('auth', () => {
      UI.render.authStatus();
    });

    // Subscribe to data changes
    State.subscribe('data', () => {
      UI.render.members();
      UI.render.timeline();
    });

    // Subscribe to timezone changes
    State.subscribe('timezone', () => {
      UI.render.timezoneUI();
      UI.render.timeSlots();
    });

    // Subscribe to loading changes
    State.subscribe('loading', (isLoading) => {
      UI.loading.show(isLoading);
    });
  }

  // Load initial data
  async function loadInitialData() {
    State.setLoading(true);
    try {
      await API.loadData();
      UI.updateAll();
    } finally {
      State.setLoading(false);
    }
  }

  // Authentication functions
  async function authenticate() {
    const tokenInput = document.getElementById('githubToken');
    const token = tokenInput.value.trim();

    if (!token) {
      UI.toast.show(t('enterGithubToken'), 'error');
      return;
    }

    try {
      State.setLoading(true);

      // Test authentication
      await API.testAuth(token);

      // Set auth state
      State.setAuth(token, true);

      // Load fresh data after authentication
      await API.loadData(false); // Force refresh

      // Update UI with authenticated state
      UI.updateAll();

      // Update floating button
      updateFloatingAuthButton();

      UI.toast.show(t('authenticationSuccessful'), 'success');

      // Clear input and hide auth section
      tokenInput.value = '';
      document.getElementById('authSection').classList.add('hidden');

    } catch (error) {
      Utils.error.log('Authentication', error);
      UI.toast.show(t('invalidToken'), 'error');
    } finally {
      State.setLoading(false);
    }
  }

  // Modal authentication functions
  function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('active');
      // Hide notification when modal opens
      const notification = document.getElementById('fabNotification');
      if (notification) {
        notification.classList.add('hidden');
      }
      // Focus on token input
      setTimeout(() => {
        const tokenInput = document.getElementById('modalGithubToken');
        if (tokenInput) tokenInput.focus();
      }, 300);
    }
  }

  function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  async function authenticateFromModal() {
    const tokenInput = document.getElementById('modalGithubToken');
    const token = tokenInput.value.trim();

    if (!token) {
      UI.toast.show(t('enterGithubToken'), 'error');
      return;
    }

    try {
      State.setLoading(true);

      // Test authentication
      await API.testAuth(token);

      // Set auth state
      State.setAuthenticated(true, token);

      // Update modal UI to show success
      const authControls = document.getElementById('modalAuthControls');
      const authSuccess = document.getElementById('modalAuthSuccess');
      const statusBadge = document.getElementById('modalAuthStatusBadge');

      if (authControls && authSuccess) {
        authControls.style.display = 'none';
        authSuccess.style.display = 'block';

        // Update status badge
        if (statusBadge) {
          statusBadge.innerHTML = `
            <span class="status-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </span>
            <span data-translate="authenticated">${t('authenticated', 'Authenticated')}</span>
          `;
          statusBadge.style.background = 'rgba(68, 255, 68, 0.1)';
          statusBadge.style.borderColor = 'rgba(68, 255, 68, 0.3)';
          statusBadge.style.color = '#44ff44';
        }
      }

      // Load fresh data after authentication
      await API.loadData(false); // Force refresh

      // Update UI with authenticated state
      UI.updateAll();

      // Update floating button
      updateFloatingAuthButton();

      UI.toast.show(t('authenticationSuccessful'), 'success');

      // Clear token input
      tokenInput.value = '';

      // Hide auth section
      document.getElementById('authSection').classList.add('hidden');

      // Close modal after a delay
      setTimeout(() => {
        closeAuthModal();
        // Reset modal state for next use
        if (authControls && authSuccess) {
          authControls.style.display = 'block';
          authSuccess.style.display = 'none';
        }
        if (statusBadge) {
          statusBadge.innerHTML = `
            <span class="status-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            <span data-translate="notAuthenticated">${t('notAuthenticated', 'Not authenticated')}</span>
          `;
          statusBadge.style.background = 'rgba(255, 68, 68, 0.1)';
          statusBadge.style.borderColor = 'rgba(255, 68, 68, 0.3)';
          statusBadge.style.color = '#ff6b6b';
        }
      }, 2000);

    } catch (error) {
      Utils.error.log('Authentication', error);
      UI.toast.show(t('invalidToken'), 'error');
    } finally {
      State.setLoading(false);
    }
  }

  function updateFloatingAuthButton() {
    const floatingBtn = document.getElementById('floatingAuthBtn');
    if (!floatingBtn) return;

    const isAuthenticated = State.isAuthenticated();

    if (isAuthenticated) {
      // Change button to green checkmark
      floatingBtn.classList.add('authenticated');
      floatingBtn.innerHTML = `
        <svg class="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
      // Hide button after animation
      setTimeout(() => {
        floatingBtn.classList.add('hide');
      }, 2000);
    } else {
      // Show auth button with lock icon
      floatingBtn.classList.remove('authenticated', 'hide');
      floatingBtn.innerHTML = `
        <div class="fab-notification" id="fabNotification">
          <span data-translate="clickToAuth">${t('clickToAuth', 'Click to authenticate')}</span>
          <div class="notification-arrow"></div>
        </div>
        <svg class="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <div class="fab-ripple"></div>
      `;
    }
  }

  async function logout() {
    try {
      // Clear authentication state
      State.setAuth(null, false);

      // Clear the token input field
      const tokenInput = document.getElementById('githubToken');
      if (tokenInput) {
        tokenInput.value = '';
      }

      // Show auth section
      const authSection = document.getElementById('authSection');
      if (authSection) {
        authSection.classList.remove('hidden');
      }

      // Hide logout buttons
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.style.display = 'none';
      }

      // Hide mobile logout button
      const mobileLogoutSection = document.querySelector('.mobile-logout-section');
      if (mobileLogoutSection) {
        mobileLogoutSection.style.display = 'none';
      }

      // Clear any cached data
      State.setData(null);

      // Reload data without authentication
      await API.loadData();

      // Refresh entire UI
      UI.updateAll();

      // Update floating button
      updateFloatingAuthButton();

      // Show success message
      UI.toast.show(t('loggedOut') || 'Successfully logged out', 'success');

      // Switch to submit-info tab if on a restricted tab
      const activeTab = State.getActiveTab();
      if (activeTab === 'view-alliance') {
        switchTab('submit-info');
      }

    } catch (error) {
      console.error('Logout error:', error);
      UI.toast.show('Logout completed', 'info');
    }
  }

  // Timezone functions
  function checkTimezone() {
    const { isConfirmed } = State.getTimezone();

    if (!isConfirmed) {
      setTimeout(() => showTimezoneModal(), 1000);
    }
  }

  function showTimezoneModal() {
    const detected = Utils.timezone.detectUserTimezone();
    State.setTimezone(false, null, detected);

    updateTimeDisplays();
    document.getElementById('timezoneModal').classList.add('active');

    // Update time displays every second
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
    }

    timeUpdateInterval = setInterval(() => {
      const modal = document.getElementById('timezoneModal');
      if (modal.classList.contains('active')) {
        updateTimeDisplays();
      } else {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
      }
    }, Config.TIMERS.TIME_UPDATE_INTERVAL);
  }

  function updateTimeDisplays() {
    const { detected } = State.getTimezone();
    if (!detected) return;

    const now = new Date();

    try {
      // User's local time
      const userTimeString = Utils.format.time(now, detected.iana);
      document.getElementById('userLocalTime').textContent = userTimeString;
      document.getElementById('userTimezone').textContent = `${detected.iana} (${detected.utc})`;

      // Server time
      const serverTimeString = Utils.format.time(now, 'Etc/GMT+2');
      document.getElementById('serverTime').textContent = serverTimeString;

      // Time relationship
      const timeDiff = detected.offset - Config.SERVER.TIMEZONE_OFFSET;
      const diff = Math.abs(timeDiff);

      let relationshipText;
      if (timeDiff > 0) {
        relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? 's' : ''} ahead of server time`;
      } else if (timeDiff < 0) {
        relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? 's' : ''} behind server time`;
      } else {
        relationshipText = 'Your timezone matches server time perfectly!';
      }

      document.getElementById('timeRelationship').textContent = relationshipText;
    } catch (error) {
      Utils.error.log('Update time displays', error);
    }
  }

  async function confirmTimezone() {
    const { detected } = State.getTimezone();
    if (!detected) return;

    State.setTimezone(true, detected.utc, detected);
    document.getElementById('timezoneModal').classList.remove('active');

    // Ensure UI updates after timezone confirmation
    await new Promise(resolve => setTimeout(resolve, 100));
    UI.updateAll();

    UI.toast.show(t('timezoneConfirmedMessage'), 'success');
  }

  async function changeTimezone() {
    document.getElementById('timezoneModal').classList.remove('active');
    document.getElementById('manualTimezoneGroup').style.display = 'block';

    State.setTimezone(false, null);

    // Ensure UI updates after timezone change
    await new Promise(resolve => setTimeout(resolve, 100));
    updateServerTimeDisplay();
    UI.updateAll();
  }

  function handleManualTimezoneChange() {
    const selectedTz = document.getElementById('timezone').value;
    if (selectedTz) {
      State.setTimezone(true, selectedTz);
      updateServerTimeDisplay();
      UI.toast.show(t('timezoneSetMessage', { timezone: selectedTz }), 'success');
    }
  }

  function updateServerTimeDisplay() {
    const selectedTz = document.getElementById('timezone').value;
    if (!selectedTz) return;

    const tzOffset = parseInt(selectedTz.replace('UTC', '')) || 0;
    const serverOffset = Config.SERVER.TIMEZONE_OFFSET;
    const timeDiff = tzOffset - serverOffset;
    const diff = Math.abs(timeDiff);

    let relationshipText;
    if (timeDiff > 0) {
      relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? 's' : ''} ahead of server time`;
    } else if (timeDiff < 0) {
      relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? 's' : ''} behind server time`;
    } else {
      relationshipText = 'Your timezone matches server time';
    }

    const serverTime = new Date();
    serverTime.setHours(serverTime.getUTCHours() + serverOffset);

    document.getElementById('serverTimeInfo').innerHTML = `
      ${relationshipText}<br>
      Current server time: ${serverTime.toTimeString().slice(0, 5)} (UTC-2)
    `;
  }

  // Member management functions
  async function submitMemberInfo() {
    const { isAuthenticated } = State.getAuth();
    const { isConfirmed, confirmed } = State.getTimezone();

    // Validate authentication
    if (!isAuthenticated) {
      UI.toast.show(t('mustAuthenticate'), 'error');
      return;
    }

    // Validate timezone
    if (!isConfirmed || !confirmed) {
      UI.toast.show(t('confirmTimezoneBeforeSubmit'), 'error');
      if (!isConfirmed) {
        showTimezoneModal();
      }
      return;
    }

    // Get form values
    const username = document.getElementById('username').value.trim();
    const carPower = document.getElementById('carPower').value.replace(/[,\s]/g, '');
    const towerLevel = document.getElementById('towerLevel').value;

    // Validate inputs
    if (!Utils.validation.isValidUsername(username)) {
      UI.toast.show(t('enterUsername'), 'error');
      return;
    }

    const data = State.getData();
    const existingMember = Utils.data.findMemberByUsername(data.members, username);
    const isExisting = !!existingMember;

    // Validate based on member status
    if (!isExisting) {
      // New member requires all fields
      if (!Utils.validation.isValidCarPower(carPower) ||
          !Utils.validation.isValidTowerLevel(towerLevel)) {
        UI.toast.show(t('newMemberRequirements'), 'error');
        return;
      }
    } else {
      // Existing member requires at least one field
      if (!carPower && !towerLevel) {
        UI.toast.show(t('updateRequiresAtLeastOneField'), 'error');
        return;
      }
    }

    // Collect time slots
    const timeSlots = {};
    Config.DAYS.forEach(day => {
      const daySlots = [];
      Config.TIME_SLOTS.forEach(slot => {
        const btn = document.querySelector(`[data-day="${day}"][data-slot="${slot.id}"]`);
        if (btn && btn.classList.contains('active')) {
          daySlots.push(slot.id);
        }
      });
      if (daySlots.length > 0) {
        timeSlots[day] = daySlots;
      }
    });

    // Prepare submission data
    const memberData = {
      username: Utils.validation.sanitizeInput(username),
      carPower: carPower ? parseInt(carPower) : (existingMember?.carPower || 0),
      towerLevel: towerLevel ? parseInt(towerLevel) : (existingMember?.towerLevel || 0),
      timezone: confirmed,
      availability: timeSlots,
      submittedAt: new Date().toISOString()
    };

    try {
      State.setLoading(true);

      // Submit and wait for backend to complete
      const result = await API.submitMemberInfo(memberData);

      // Reload data to ensure UI shows latest from backend
      await API.loadData(false); // Force refresh, no cache

      // Now update UI with fresh data
      UI.updateAll();

      // Show success message
      if (result.isUpdate) {
        const hasTimeSlotsSelected = Object.keys(timeSlots).length > 0;
        if (!hasTimeSlotsSelected) {
          const updatedFields = [];
          if (carPower) updatedFields.push(t('carPower'));
          if (towerLevel) updatedFields.push(t('towerLevel'));
          UI.toast.show(t('carPowerUpdated', {
            username: existingMember.username,
            fields: updatedFields.join(` ${t('and')} `)
          }), 'success');
        } else {
          UI.toast.show(t('memberInfoFullyUpdated', {
            username: existingMember.username
          }), 'success');
        }
      } else {
        UI.toast.show(t('memberInfoSubmitted'), 'success');
      }

      // Clear form
      clearMemberForm();

    } catch (error) {
      Utils.error.log('Submit member info', error);

      // Handle authentication errors specifically
      if (error.requiresAuth || error.status === 401 || error.status === 403) {
        UI.toast.show(t('sessionExpired') || 'Your session has expired. Please authenticate again.', 'error');
        // Show auth modal
        openAuthModal();
      } else {
        UI.toast.show(t('errorSavingData', { error: Utils.error.getMessage(error) }), 'error');
      }
    } finally {
      State.setLoading(false);
    }
  }

  function clearMemberForm() {
    document.getElementById('username').value = '';
    document.getElementById('carPower').value = '';
    document.getElementById('towerLevel').value = '';

    document.querySelectorAll('.time-slot-btn.active').forEach(btn => {
      btn.classList.remove('active');
    });

    State.clearUserSelections();
  }

  async function deleteMember(memberId) {
    const password = await UI.modal.prompt(
      '🔒 Authentication Required',
      'Enter the R5 password to delete this member:'
    );

    if (password === Config.AUTH.R5_PASSWORD) {
      try {
        State.setLoading(true);

        // Delete and wait for backend to complete
        const member = await API.deleteMember(memberId);

        // Reload data to ensure UI shows latest from backend
        await API.loadData(false); // Force refresh, no cache

        // Now update UI with fresh data
        UI.updateAll();

        UI.toast.show(t('memberRemoved', { memberName: member.username }), 'success');
      } catch (error) {
        Utils.error.log('Delete member', error);

        // Handle authentication errors specifically
        if (error.requiresAuth || error.status === 401 || error.status === 403) {
          UI.toast.show(t('sessionExpired') || 'Your session has expired. Please authenticate again.', 'error');
          openAuthModal();
        } else {
          UI.toast.show(t('errorSavingData', { error: Utils.error.getMessage(error) }), 'error');
        }
      } finally {
        State.setLoading(false);
      }
    } else if (password !== null) {
      UI.toast.show(t('incorrectPassword'), 'error');
    }
  }

  // Registration functions
  async function handleRegistrationSubmit(event) {
    event.preventDefault();

    // Collect form data
    const formData = {
      username: Utils.validation.sanitizeInput(document.getElementById('regUsername').value.trim()),
      carPower: parseInt(document.getElementById('regCarPower').value),
      towerLevel: parseInt(document.getElementById('regTowerLevel').value),
      dailyPoints: parseInt(document.getElementById('regDailyPoints').value),
      exAlliances: Utils.validation.sanitizeInput(document.getElementById('regExAlliances').value.trim()),
      whyLeft: Utils.validation.sanitizeInput(document.getElementById('regWhyLeft').value.trim()),
      whyJoin: Utils.validation.sanitizeInput(document.getElementById('regWhyJoin').value.trim()),
      motivation: Utils.validation.sanitizeInput(document.getElementById('regMotivation').value.trim())
    };

    // Validate
    if (!Utils.validation.isValidUsername(formData.username) ||
        !Utils.validation.isValidCarPower(formData.carPower) ||
        !Utils.validation.isValidTowerLevel(formData.towerLevel) ||
        !Utils.validation.isValidDailyPoints(formData.dailyPoints) ||
        !formData.whyJoin || !formData.motivation) {
      UI.toast.show(t('fillAllFields'), 'error');
      return;
    }

    // Show confirmation
    const confirmed = await showRegistrationConfirmation(formData);
    if (!confirmed) return;

    // Submit
    try {
      State.setLoading(true);

      // Submit registration and wait for backend
      await API.submitRegistration(formData);

      // Reload data to ensure UI shows latest
      await API.loadData(false); // Force refresh

      // Update UI with fresh data
      UI.updateAll();

      UI.toast.show('Registration application submitted successfully!', 'success');

      // Clear form
      document.getElementById('registrationForm').reset();

    } catch (error) {
      Utils.error.log('Submit registration', error);

      // Handle authentication errors specifically
      if (error.requiresAuth || error.status === 401 || error.status === 403) {
        UI.toast.show(t('sessionExpired') || 'Your session has expired. Please authenticate again.', 'error');
        openAuthModal();
      } else {
        UI.toast.show(`Error submitting registration: ${Utils.error.getMessage(error)}`, 'error');
      }
    } finally {
      State.setLoading(false);
    }
  }

  async function showRegistrationConfirmation(formData) {
    const modal = document.getElementById('customModal');
    const titleEl = document.getElementById('customModalTitle');
    const messageEl = document.getElementById('customModalMessage');

    titleEl.textContent = '📋 Confirm Registration Application';
    messageEl.innerHTML = `
      <div style="text-align: left; background: rgba(10, 10, 10, 0.5); padding: 20px; border-radius: 10px; margin: 15px 0;">
        <h4 style="color: #4a9eff; margin-bottom: 15px;">Review Your Information:</h4>
        <p><strong>Username:</strong> ${formData.username}</p>
        <p><strong>Car Power:</strong> ${Utils.format.number(formData.carPower)}</p>
        <p><strong>Tower Level:</strong> ${formData.towerLevel}</p>
        <p><strong>Daily VS Points:</strong> ${Utils.format.number(formData.dailyPoints)}</p>
        <p><strong>Previous Alliances:</strong> ${formData.exAlliances || 'None specified'}</p>
        <p><strong>Reason for leaving:</strong> ${formData.whyLeft || 'N/A'}</p>
        <p><strong>Why join TDC:</strong> ${formData.whyJoin}</p>
        <p><strong>Motivation:</strong> ${formData.motivation}</p>
      </div>
      <p style="color: #ffcc00; font-weight: bold;">Are you sure you want to submit this application?</p>
    `;

    return UI.modal.confirm('📋 Confirm Registration Application', '');
  }

  // UI Helper functions
  function toggleTimeSlot(day, slotId) {
    const { isConfirmed } = State.getTimezone();

    if (!isConfirmed) {
      UI.toast.show(t('confirmTimezoneBeforeSelect'), 'error');
      showTimezoneModal();
      return;
    }

    const btn = document.querySelector(`[data-day="${day}"][data-slot="${slotId}"]`);
    if (btn.classList.contains('disabled')) return;

    const isActive = btn.classList.contains('active');
    btn.classList.toggle('active');

    State.updateUserSelection(day, slotId, !isActive);
  }

  function toggleMemberTimeslots(memberId) {
    const toggleButton = document.querySelector(`.timeslots-toggle[data-member-id="${memberId}"]`);
    const timeSlotsDiv = document.querySelector(`.time-slots[data-member-id="${memberId}"]`);
    const toggleIcon = toggleButton?.querySelector('.toggle-icon');

    if (timeSlotsDiv && toggleButton) {
      const isCollapsed = timeSlotsDiv.classList.contains('collapsed');

      if (isCollapsed) {
        timeSlotsDiv.classList.remove('collapsed');
        toggleButton.classList.add('expanded');
        if (toggleIcon) {
          toggleIcon.innerHTML = '<line x1="5" y1="12" x2="19" y2="12"></line>';
        }
      } else {
        timeSlotsDiv.classList.add('collapsed');
        toggleButton.classList.remove('expanded');
        if (toggleIcon) {
          toggleIcon.innerHTML = `
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          `;
        }
      }
    }
  }

  function filterMembers() {
    const searchInput = document.getElementById('memberSearchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const memberCards = document.querySelectorAll('.member-card');

    memberCards.forEach(card => {
      const username = card.getAttribute('data-username');
      card.style.display = username.includes(searchTerm) ? 'block' : 'none';
    });
  }

  // Tab management with smooth animations
  function switchTab(tabName) {
    const currentTab = document.querySelector('.tab-content.active');
    const newTab = document.getElementById(`${tabName}-tab`);

    // If same tab, do nothing
    if (currentTab === newTab) return;

    // Get tab indices for slide direction
    const tabs = ['submit-info', 'registration-form', 'view-alliance'];
    const currentIndex = currentTab ? tabs.indexOf(currentTab.id.replace('-tab', '')) : -1;
    const newIndex = tabs.indexOf(tabName);

    // Determine animation direction
    const slideDirection = newIndex > currentIndex ? 'slide-left' : 'slide-right';

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Activate new tab button
    const newTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (newTabBtn) {
      newTabBtn.classList.add('active');
    }

    // Clean tab transition without double animation
    if (currentTab) {
      // Remove all classes and hide current tab
      currentTab.classList.remove('active', 'slide-left', 'slide-right');
      currentTab.style.display = 'none';
    }

    // Show new tab with animation
    if (newTab) {
      // Reset classes first
      newTab.classList.remove('slide-left', 'slide-right');

      if (currentTab) {
        // Apply animation for tab switching
        newTab.style.display = 'block';
        newTab.classList.add('active', slideDirection);
      } else {
        // Initial load - no animation
        newTab.style.display = 'block';
        newTab.classList.add('active');
      }
    }

    // Save state
    State.setActiveTab(tabName);

    // Refresh content if needed
    if (tabName === 'view-alliance') {
      setTimeout(() => {
        UI.render.members();
        UI.render.timeline();
      }, 100);
    }
  }

  function initializeTabs() {
    const savedTab = State.getActiveTab();
    if (savedTab && document.getElementById(`${savedTab}-tab`)) {
      switchTab(savedTab);
    } else {
      switchTab('submit-info');
    }
  }

  // Language management
  function initializeLanguage() {
    const lang = State.getLanguage();
    const flagElement = document.getElementById('currentFlag');

    if (flagElement && languages[lang]) {
      flagElement.innerHTML = languages[lang].flag;
    }

    updateAllTranslations();
  }

  function toggleLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    const btn = document.getElementById('languageBtn');

    menu.classList.toggle('show');
    btn.classList.toggle('active');

    if (menu.classList.contains('show')) {
      setTimeout(() => {
        document.addEventListener('click', closeLanguageMenuOnOutsideClick);
      }, 10);
    }
  }

  function closeLanguageMenuOnOutsideClick(event) {
    const menu = document.getElementById('languageMenu');
    const btn = document.getElementById('languageBtn');

    if (!menu.contains(event.target) && !btn.contains(event.target)) {
      menu.classList.remove('show');
      btn.classList.remove('active');
      document.removeEventListener('click', closeLanguageMenuOnOutsideClick);
    }
  }

  function changeLanguage(langCode) {
    if (translations[langCode]) {
      State.setLanguage(langCode);

      // Update flag display
      const flagElement = document.getElementById('currentFlag');
      if (flagElement && languages[langCode]) {
        flagElement.innerHTML = languages[langCode].flag;
      }

      // Close menus
      document.getElementById('languageMenu')?.classList.remove('show');
      document.getElementById('languageBtn')?.classList.remove('active');
      document.getElementById('mobileSettingsPanel')?.classList.remove('show');

      // Update translations
      updateAllTranslations();
      UI.toast.show(t('languageChanged'), 'success');
    }
  }

  // Auto-refresh
  function startAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    autoRefreshInterval = setInterval(async () => {
      try {
        await API.loadData(false); // Don't use cache
      } catch (error) {
        Utils.error.log('Auto-refresh', error);
      }
    }, Config.TIMERS.AUTO_REFRESH);
  }

  // Window resize handler
  function setupResizeHandler() {
    const debouncedResize = Utils.dom.debounce(() => {
      const data = State.getData();
      if (data) {
        UI.render.timeSlots();
        UI.render.timeline();
      }
    }, Config.TIMERS.RESIZE_DEBOUNCE);

    window.addEventListener('resize', debouncedResize);
  }

  // Mobile settings functions
  function toggleMobileSettings() {
    const panel = document.getElementById('mobileSettingsPanel');
    panel.classList.toggle('show');

    if (panel.classList.contains('show')) {
      setTimeout(() => {
        document.addEventListener('click', closeMobileSettingsOnOutsideClick);
      }, 10);
    }
  }

  function closeMobileSettingsOnOutsideClick(event) {
    const panel = document.getElementById('mobileSettingsPanel');
    const btn = document.getElementById('mobileSettingsBtn');

    if (!panel.contains(event.target) && !btn.contains(event.target)) {
      panel.classList.remove('show');
      document.removeEventListener('click', closeMobileSettingsOnOutsideClick);
    }
  }

  // Admin functions
  async function requestAdminAccess() {
    const password = await UI.modal.prompt(
      '🔒 Admin Access Required',
      'Enter the admin password to view pending applications:'
    );

    if (password === Config.AUTH.ADMIN_PASSWORD) {
      showPendingApplications();
    } else if (password !== null) {
      UI.toast.show('Incorrect admin password', 'error');
    }
  }

  function showPendingApplications() {
    const listContainer = document.getElementById('pendingApplicationsList');
    const grid = document.getElementById('applicationsGrid');
    const data = State.getData();

    if (!data.registrations) {
      data.registrations = [];
    }

    const pendingApps = data.registrations.filter(app => app.status === 'pending');

    if (pendingApps.length === 0) {
      grid.innerHTML = `
        <div style="text-align: center; color: #888; padding: 20px;">
          <p>No pending applications</p>
        </div>
      `;
    } else {
      grid.innerHTML = pendingApps.map(app => `
        <div class="member-card" style="position: relative;">
          <h3>${Utils.validation.sanitizeInput(app.username)}</h3>
          <div class="stats">
            <span class="power">Power: ${Utils.format.number(app.carPower)}</span> |
            <span class="tower">Tower: ${app.towerLevel}</span>
          </div>
          <div class="stats">Daily VS Points: ${Utils.format.number(app.dailyPoints)}</div>
          <div style="background: rgba(10, 10, 10, 0.6); padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px;">
            <p><strong>Previous Alliances:</strong> ${app.exAlliances || 'None'}</p>
            <p><strong>Reason for leaving:</strong> ${app.whyLeft || 'N/A'}</p>
            <p><strong>Why join TDC:</strong> ${app.whyJoin}</p>
            <p><strong>Motivation:</strong> ${app.motivation}</p>
          </div>
          <div class="stats" style="font-size: 11px; color: #888;">
            Submitted: ${Utils.format.date(app.submittedAt)}
          </div>
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button
              class="btn btn-success"
              style="flex: 1; padding: 8px 12px; font-size: 12px;"
              onclick="App.handleApplicationAction(${app.id}, 'approved')"
            >
              ✅ Approve
            </button>
            <button
              class="btn btn-danger"
              style="flex: 1; padding: 8px 12px; font-size: 12px;"
              onclick="App.handleApplicationAction(${app.id}, 'declined')"
            >
              ❌ Decline
            </button>
          </div>
        </div>
      `).join('');
    }

    listContainer.style.display = 'block';
  }

  async function handleApplicationAction(appId, action) {
    const password = await UI.modal.prompt(
      '🔒 Confirm Action',
      `Enter admin password to ${action === 'approved' ? 'approve' : 'decline'} this application:`
    );

    if (password !== Config.AUTH.ADMIN_PASSWORD) {
      if (password !== null) {
        UI.toast.show('Incorrect admin password', 'error');
      }
      return;
    }

    try {
      State.setLoading(true);

      // Handle application and wait for backend
      await API.handleApplication(appId, action);

      // Reload data to ensure UI shows latest
      await API.loadData(false); // Force refresh

      // Update UI with fresh data
      UI.updateAll();

      UI.toast.show(`Application ${action === 'approved' ? 'approved' : 'declined'} successfully!`, 'success');

      // Refresh the applications display
      showPendingApplications();
    } catch (error) {
      Utils.error.log('Handle application', error);

      // Handle authentication errors specifically
      if (error.requiresAuth || error.status === 401 || error.status === 403) {
        UI.toast.show(t('sessionExpired') || 'Your session has expired. Please authenticate again.', 'error');
        openAuthModal();
      } else {
        UI.toast.show(`Error updating application: ${Utils.error.getMessage(error)}`, 'error');
      }
    } finally {
      State.setLoading(false);
    }
  }

  // Toggle timeline visibility
  function toggleTimeline() {
    const isCollapsed = State.isTimelineCollapsed();
    const container = document.getElementById('timelineContainer');
    const toggleBtn = document.getElementById('timelineToggleBtn');
    const toggleIcon = toggleBtn?.querySelector('.timeline-toggle-icon');

    if (container) {
      if (isCollapsed) {
        // Expand
        container.classList.remove('collapsed');
        State.setTimelineCollapsed(false);
        if (toggleIcon) {
          toggleIcon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
        }
      } else {
        // Collapse
        container.classList.add('collapsed');
        State.setTimelineCollapsed(true);
        if (toggleIcon) {
          toggleIcon.innerHTML = '<polyline points="6 15 12 9 18 15"></polyline>';
        }
      }
    }
  }

  // Toggle time slots visibility
  function toggleTimeSlots() {
    const isCollapsed = State.isTimeSlotsCollapsed();
    const container = document.getElementById('timeSlotsContainer');
    const toggleBtn = document.getElementById('timeSlotsToggleBtn');
    const toggleIcon = toggleBtn?.querySelector('.time-slots-toggle-icon');

    if (container) {
      if (isCollapsed) {
        // Expand
        container.classList.remove('collapsed');
        State.setTimeSlotsCollapsed(false);
        if (toggleIcon) {
          toggleIcon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
        }
      } else {
        // Collapse
        container.classList.add('collapsed');
        State.setTimeSlotsCollapsed(true);
        if (toggleIcon) {
          toggleIcon.innerHTML = '<polyline points="6 15 12 9 18 15"></polyline>';
        }
      }
    }
  }

  // Initialize timeline collapsed state on load
  function initializeTimelineState() {
    const isCollapsed = State.isTimelineCollapsed();
    const container = document.getElementById('timelineContainer');
    const toggleIcon = document.querySelector('.timeline-toggle-icon');

    if (container && isCollapsed) {
      container.classList.add('collapsed');
      if (toggleIcon) {
        toggleIcon.innerHTML = '<polyline points="6 15 12 9 18 15"></polyline>';
      }
    }
  }

  // Initialize time slots collapsed state on load
  function initializeTimeSlotsState() {
    // Wait for DOM to be ready
    setTimeout(() => {
      const isCollapsed = State.isTimeSlotsCollapsed();
      const container = document.getElementById('timeSlotsContainer');
      const toggleIcon = document.querySelector('.time-slots-toggle-icon');

      if (container) {
        if (isCollapsed) {
          container.classList.add('collapsed');
          if (toggleIcon) {
            toggleIcon.innerHTML = '<polyline points="6 15 12 9 18 15"></polyline>';
          }
        } else {
          container.classList.remove('collapsed');
          if (toggleIcon) {
            toggleIcon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
          }
        }
      }
    }, 100);
  }

  // Public API
  return {
    init: initialize,
    authenticate,
    authenticateFromModal,
    openAuthModal,
    closeAuthModal,
    logout,
    submitMemberInfo,
    deleteMember,
    toggleTimeSlot,
    toggleMemberTimeslots,
    toggleTimeline,
    toggleTimeSlots,
    switchTab,
    changeLanguage,
    toggleMobileSettings,
    filterMembers,
    handleRegistrationSubmit,
    requestAdminAccess,
    handleApplicationAction,
    confirmTimezone,
    changeTimezone
  };
})();

// Initialize application when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
}

// Export for global access
window.App = App;