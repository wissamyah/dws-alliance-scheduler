const REPO_OWNER = "wissamyah";
const REPO_NAME = "dws-alliance-scheduler";
const DATA_FILE = "data.json";

// Registration system constants  
const ADMIN_PASSWORD = "ZOE";

// Get registration token (you need to set this up securely)
function getRegistrationToken() {
  // For now, this will use the authenticated user's token
  // In production, you would want to use GitHub Actions or a backend service
  return authToken || prompt("Enter registration token (contact admin):");
}

let authToken = localStorage.getItem("githubToken");
let isAuthenticated = false;
let currentData = null;
let userSelections =
  JSON.parse(localStorage.getItem("timeSlotSelections")) || {};

// Timezone management
let isTimezoneConfirmed = localStorage.getItem("timezoneConfirmed") === "true";
let confirmedTimezone = localStorage.getItem("confirmedTimezone");
let detectedTimezone = null;

// Time slot definitions - 2 hour blocks
const TIME_SLOTS = [
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
  { id: "slot12", name: "10PM-12AM", hours: [22, 23] },
];

// Helper function to get proper timezone offset
function getTimezoneOffset(timezone) {
  try {
    const now = new Date();

    // Get the current date in the specified timezone
    const localDate = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );

    // Get the current UTC date
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));

    // Calculate the difference in hours
    const offsetMs = localDate.getTime() - utcDate.getTime();
    const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));

    return offsetHours;
  } catch (e) {
    console.error("Error calculating timezone offset:", e);
    return 0;
  }
}

// Helper function to convert timezone offset to UTC string
function offsetToUTCString(offset) {
  if (offset === 0) return "UTC";
  const sign = offset >= 0 ? "+" : "";
  return `UTC${sign}${offset}`;
}

// Auto-detect user's timezone
function detectUserTimezone() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = getTimezoneOffset(timezone);
    const utcString = offsetToUTCString(offset);

    detectedTimezone = {
      iana: timezone,
      offset: offset,
      utc: utcString,
    };

    console.log("Detected timezone:", detectedTimezone);
    return detectedTimezone;
  } catch (e) {
    console.error("Timezone detection failed:", e);
    // Fallback to UTC if detection fails
    detectedTimezone = {
      iana: "UTC",
      offset: 0,
      utc: "UTC",
    };
    return detectedTimezone;
  }
}

// Update time displays in modal
function updateTimeDisplays() {
  if (!detectedTimezone) return;

  const now = new Date();

  // User's local time - use the detected timezone
  try {
    const userTimeString = now.toLocaleString("en-US", {
      timeZone: detectedTimezone.iana,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    document.getElementById("userLocalTime").textContent = userTimeString;

    // Format timezone display better
    const timezoneDisplay = `${detectedTimezone.iana} (${detectedTimezone.utc})`;
    document.getElementById("userTimezone").textContent = timezoneDisplay;
  } catch (e) {
    console.error("Error formatting user time:", e);
    const fallbackTime = now.toTimeString().slice(0, 5);
    document.getElementById("userLocalTime").textContent = fallbackTime;
    document.getElementById(
      "userTimezone"
    ).textContent = `${detectedTimezone.iana} (${detectedTimezone.utc})`;
  }

  // Server time (UTC-2)
  const serverOffset = -2;
  try {
    const serverTimeString = now.toLocaleString("en-US", {
      timeZone: "Etc/GMT+2", // Note: GMT+2 means UTC-2 (confusing but correct)
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    document.getElementById("serverTime").textContent = serverTimeString;
  } catch (e) {
    // Fallback calculation
    const serverTime = new Date();
    serverTime.setHours(serverTime.getUTCHours() + serverOffset);
    document.getElementById("serverTime").textContent = serverTime
      .toTimeString()
      .slice(0, 5);
  }

  // Time relationship - this was the bug
  const timeDiff = detectedTimezone.offset - serverOffset; // User offset minus server offset
  const diff = Math.abs(timeDiff);

  let relationshipText;
  if (timeDiff > 0) {
    relationshipText = `Your timezone is ${diff} hour${
      diff !== 1 ? "s" : ""
    } ahead of server time`;
  } else if (timeDiff < 0) {
    relationshipText = `Your timezone is ${diff} hour${
      diff !== 1 ? "s" : ""
    } behind server time`;
  } else {
    relationshipText = `Your timezone matches server time perfectly!`;
  }

  document.getElementById("timeRelationship").textContent = relationshipText;
}

// Show timezone confirmation modal
function showTimezoneModal() {
  detectUserTimezone();
  updateTimeDisplays();
  document.getElementById("timezoneModal").classList.add("active");

  // Update time displays every second
  const interval = setInterval(() => {
    if (document.getElementById("timezoneModal").classList.contains("active")) {
      updateTimeDisplays();
    } else {
      clearInterval(interval);
    }
  }, 1000);
}

// Confirm timezone
function confirmTimezone() {
  if (!detectedTimezone) return;

  isTimezoneConfirmed = true;
  confirmedTimezone = detectedTimezone.utc;

  localStorage.setItem("timezoneConfirmed", "true");
  localStorage.setItem("confirmedTimezone", confirmedTimezone);

  document.getElementById("timezoneModal").classList.remove("active");
  updateTimezoneUI();
  showMessage(t("timezoneConfirmedMessage"), "success");
}

// Change timezone (show manual selection)
function changeTimezone() {
  document.getElementById("timezoneModal").classList.remove("active");
  document.getElementById("manualTimezoneGroup").style.display = "block";

  // Update timezone status
  document.getElementById("timezoneLocked").style.display = "block";
  document.getElementById("timezoneStatus").style.display = "none";

  // Reset confirmation
  isTimezoneConfirmed = false;
  localStorage.removeItem("timezoneConfirmed");
  localStorage.removeItem("confirmedTimezone");

  updateTimezoneUI();
}

// Update timezone-related UI elements
function updateTimezoneUI() {
  const timeLocked = document.getElementById("timezoneLocked");
  const timeStatus = document.getElementById("timezoneStatus");
  const manualGroup = document.getElementById("manualTimezoneGroup");

  if (isTimezoneConfirmed && confirmedTimezone) {
    // Show confirmed status
    timeLocked.style.display = "none";
    timeStatus.style.display = "block";
    manualGroup.style.display = "none";

    document.getElementById("confirmedTimezoneText").textContent = t(
      "usingTimezone",
      { timezone: confirmedTimezone }
    );

    // Enable time slot selection
    enableTimeSlotSelection();
  } else {
    // Show locked message
    timeLocked.style.display = "block";
    timeStatus.style.display = "none";

    // Disable time slot selection
    disableTimeSlotSelection();
  }
}

// Enable time slot selection
function enableTimeSlotSelection() {
  const timeSlotButtons = document.querySelectorAll(".time-slot-btn");
  timeSlotButtons.forEach((btn) => {
    btn.classList.remove("disabled");
    btn.removeAttribute("disabled");
  });

  document.getElementById("submitBtn").disabled = false;
}

// Disable time slot selection
function disableTimeSlotSelection() {
  const timeSlotButtons = document.querySelectorAll(".time-slot-btn");
  timeSlotButtons.forEach((btn) => {
    btn.classList.add("disabled");
    btn.setAttribute("disabled", "true");
  });

  document.getElementById("submitBtn").disabled = true;
}

// Helper function to convert member's local time slots to server time (UTC-2) slots
function convertSlotsToServerTime(memberSlots, memberTimezone) {
  const serverTimeSlots = [];
  const timezoneOffset = parseInt(memberTimezone.replace("UTC", "")) || 0;
  const serverOffset = -2; // Server is UTC-2

  memberSlots.forEach((slotId) => {
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (slot) {
      // Convert each hour in the slot from local time to server time (UTC-2)
      slot.hours.forEach((localHour) => {
        // Correct conversion: subtract timezone difference
        let serverHour = localHour - (timezoneOffset - serverOffset);

        // Handle day wrap-around
        if (serverHour < 0) {
          serverHour += 24;
        } else if (serverHour >= 24) {
          serverHour -= 24;
        }

        // Find which server time slot this hour belongs to
        const serverSlot = TIME_SLOTS.find((s) => s.hours.includes(serverHour));
        if (serverSlot && !serverTimeSlots.includes(serverSlot.id)) {
          serverTimeSlots.push(serverSlot.id);
        }
      });
    }
  });

  return serverTimeSlots;
}

function updateServerTimeDisplay() {
  const selectedTz = document.getElementById("timezone").value;
  if (!selectedTz) return;

  const tzOffset = parseInt(selectedTz.replace("UTC", "")) || 0;
  const serverOffset = -2; // Server is UTC-2
  const serverTime = new Date();
  serverTime.setHours(serverTime.getUTCHours() + serverOffset);

  const localTime = new Date();
  localTime.setHours(localTime.getUTCHours() + tzOffset);

  const timeDiff = tzOffset - serverOffset;
  const diff = Math.abs(timeDiff);

  let relationshipText;
  if (timeDiff > 0) {
    relationshipText = `Your timezone is ${diff} hour${
      diff !== 1 ? "s" : ""
    } ahead of server time`;
  } else if (timeDiff < 0) {
    relationshipText = `Your timezone is ${diff} hour${
      diff !== 1 ? "s" : ""
    } behind server time`;
  } else {
    relationshipText = `Your timezone matches server time`;
  }

  document.getElementById("serverTimeInfo").innerHTML = `${relationshipText}<br>
                 Current server time: ${serverTime
                   .toTimeString()
                   .slice(0, 5)} (UTC-2)`;
}

// Handle manual timezone selection
function handleManualTimezoneChange() {
  const selectedTz = document.getElementById("timezone").value;
  if (selectedTz) {
    isTimezoneConfirmed = true;
    confirmedTimezone = selectedTz;

    localStorage.setItem("timezoneConfirmed", "true");
    localStorage.setItem("confirmedTimezone", confirmedTimezone);

    updateTimezoneUI();
    updateServerTimeDisplay();
    showMessage(t("timezoneSetMessage", { timezone: selectedTz }), "success");
  }
}

async function loadData() {
  showLoading(true);
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`
    );
    const file = await response.json();
    const content = atob(file.content);
    currentData = JSON.parse(content);
    currentData.sha = file.sha;
    renderUI();
  } catch (error) {
    showMessage(t("errorLoadingData", { error: error.message }), "error");
  }
  showLoading(false);
}

async function saveData() {
  if (!isAuthenticated || !authToken) {
    showMessage(t("mustAuthenticateToSave"), "error");
    return;
  }
  showLoading(true);
  try {
    currentData.lastUpdated = new Date().toISOString();
    const content = btoa(JSON.stringify(currentData, null, 2));

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update alliance data",
          content: content,
          sha: currentData.sha,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to save");

    const result = await response.json();
    currentData.sha = result.content.sha;
    showMessage(t("dataSavedSuccessfully"), "success");
  } catch (error) {
    showMessage(t("errorSavingData", { error: error.message }), "error");
  }
  showLoading(false);
}

function authenticate() {
  const token = document.getElementById("githubToken").value;
  if (!token) {
    showMessage(t("enterGithubToken"), "error");
    return;
  }
  authToken = token;
  localStorage.setItem("githubToken", token);
  isAuthenticated = true;
  updateAuthStatus();
  renderUI();
  showMessage(t("authenticationSuccessful"), "success");

  // Hide auth section after authentication
  document.getElementById("authSection").classList.add("hidden");
}

function logout() {
  authToken = null;
  isAuthenticated = false;
  localStorage.removeItem("githubToken");
  document.getElementById("githubToken").value = "";
  updateAuthStatus();
  renderUI();

  // Show auth section again
  document.getElementById("authSection").classList.remove("hidden");
}

function updateAuthStatus() {
  const authStatusEl = document.getElementById("authStatus");
  const authControlsEl = document.getElementById("authControls");
  const logoutBtnEl = document.getElementById("logoutBtn");

  if (authStatusEl) {
    authStatusEl.textContent = isAuthenticated
      ? "Authenticated"
      : "Not authenticated";
  }

  if (authControlsEl) {
    authControlsEl.style.display = isAuthenticated ? "none" : "block";
  }

  if (logoutBtnEl) {
    logoutBtnEl.style.display = isAuthenticated ? "inline-block" : "none";
  }
}

function submitMemberInfo() {
  // Check if user is authenticated first
  if (!isAuthenticated) {
    showMessage(t("mustAuthenticate"), "error");
    return;
  }

  // Check if timezone is confirmed
  if (!isTimezoneConfirmed || !confirmedTimezone) {
    showMessage(t("confirmTimezoneBeforeSubmit"), "error");
    if (!isTimezoneConfirmed) {
      showTimezoneModal();
    }
    return;
  }

  const username = document.getElementById("username").value;
  const carPower = document
    .getElementById("carPower")
    .value.replace(/[,\s]/g, "");
  const towerLevel = document.getElementById("towerLevel").value;

  if (!username) {
    showMessage(t("enterUsername"), "error");
    return;
  }

  // Helper function to normalize username for comparison (remove spaces, convert to lowercase)
  function normalizeUsername(name) {
    return name.replace(/\s+/g, "").toLowerCase();
  }

  // Check if member with same username already exists (ignoring case and spaces)
  const normalizedInputUsername = normalizeUsername(username);
  const existingMemberIndex = currentData.members.findIndex(
    (member) => normalizeUsername(member.username) === normalizedInputUsername
  );

  const isExistingMember = existingMemberIndex !== -1;

  // For new members, require both car power and tower level
  if (!isExistingMember && (!carPower || !towerLevel)) {
    showMessage(t("newMemberRequirements"), "error");
    return;
  }

  // For existing members, require at least one of car power or tower level (for quick updates)
  if (isExistingMember && !carPower && !towerLevel) {
    showMessage(t("updateRequiresAtLeastOneField"), "error");
    return;
  }

  const timeSlots = {};
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  days.forEach((day) => {
    const daySlots = [];
    TIME_SLOTS.forEach((slot) => {
      const btn = document.querySelector(
        `[data-day="${day}"][data-slot="${slot.id}"]`
      );
      if (btn && btn.classList.contains("active")) {
        daySlots.push(slot.id);
      }
    });
    if (daySlots.length > 0) {
      timeSlots[day] = daySlots;
    }
  });

  const submission = {
    id: Date.now(),
    username,
    carPower: parseInt(carPower),
    towerLevel: parseInt(towerLevel),
    timezone: confirmedTimezone,
    availability: timeSlots,
    submittedAt: new Date().toISOString(),
  };

  if (isExistingMember) {
    // Existing member - use smart selective update
    const existingMember = currentData.members[existingMemberIndex];
    const hasTimeSlotsSelected = Object.keys(timeSlots).length > 0;

    if (!hasTimeSlotsSelected) {
      // Quick update mode: only update car power and/or tower level, preserve everything else
      const updatedMember = { ...existingMember };

      // Update car power if provided
      if (carPower.trim()) {
        updatedMember.carPower = parseInt(carPower);
      }

      // Update tower level if provided
      if (towerLevel.trim()) {
        updatedMember.towerLevel = parseInt(towerLevel);
      }

      // Update timestamp
      updatedMember.submittedAt = new Date().toISOString();

      currentData.members[existingMemberIndex] = updatedMember;

      const updatedFields = [];
      if (carPower.trim()) updatedFields.push(t("carPower"));
      if (towerLevel.trim()) updatedFields.push(t("towerLevel"));

      showMessage(
        t("carPowerUpdated", {
          username: existingMember.username,
          fields: updatedFields.join(` ${t("and")} `),
        }),
        "success"
      );
    } else {
      // Full update mode: user selected timeslots, so update everything
      submission.id = existingMember.id; // Keep original ID
      submission.username = existingMember.username; // Keep original username format

      // If car power or tower level not provided, keep existing values
      if (!carPower.trim()) {
        submission.carPower = existingMember.carPower;
      }
      if (!towerLevel.trim()) {
        submission.towerLevel = existingMember.towerLevel;
      }

      currentData.members[existingMemberIndex] = submission;
      showMessage(
        t("memberInfoFullyUpdated", { username: existingMember.username }),
        "success"
      );
    }
  } else {
    // New member
    currentData.members.push(submission);
    showMessage(t("memberInfoSubmitted"), "success");
  }

  saveData();

  // Immediately update the UI
  renderMembers();
  renderTimeline();

  // Clear form
  document.getElementById("username").value = "";
  document.getElementById("carPower").value = "";
  document.getElementById("towerLevel").value = "";
  document.querySelectorAll(".time-slot-btn.active").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Clear localStorage selections
  userSelections = {};
  localStorage.removeItem("timeSlotSelections");
}

function toggleTimeSlot(day, slotId) {
  // Check if timezone is confirmed
  if (!isTimezoneConfirmed) {
    showMessage(t("confirmTimezoneBeforeSelect"), "error");
    showTimezoneModal();
    return;
  }

  const btn = document.querySelector(
    `[data-day="${day}"][data-slot="${slotId}"]`
  );

  if (btn.classList.contains("disabled")) {
    return;
  }

  btn.classList.toggle("active");

  // Save to localStorage
  if (!userSelections[day]) userSelections[day] = [];
  const index = userSelections[day].indexOf(slotId);
  if (index > -1) {
    userSelections[day].splice(index, 1);
    if (userSelections[day].length === 0) {
      delete userSelections[day];
    }
  } else {
    userSelections[day].push(slotId);
  }
  localStorage.setItem("timeSlotSelections", JSON.stringify(userSelections));
}

async function showDeleteModal(id) {
  // Ask for R5 password using custom modal
  const password = await showCustomPrompt(
    "🔒 Authentication Required", 
    "Enter the R5 password to delete this member:"
  );

  if (password === "R5") {
    deleteMember(id);
  } else if (password !== null) {
    // null means user cancelled
    showMessage(t("incorrectPassword"), "error");
  }
}

function deleteMember(id) {
  if (!isAuthenticated) {
    showMessage(t("mustAuthenticateToDelete"), "error");
    return;
  }

  // Get member info before deletion for the message
  const member = currentData.members.find((m) => m.id === id);
  const memberName = member ? member.username : "Member";

  currentData.members = currentData.members.filter((m) => m.id !== id);
  saveData();
  showMessage(t("memberRemoved", { memberName: memberName }), "success");

  // Immediately update the UI to remove the member and update timeline
  renderMembers();
  renderTimeline();
}

function renderUI() {
  if (!currentData) return;

  // Populate timezone dropdown
  const timezoneSelect = document.getElementById("timezone");
  timezoneSelect.innerHTML = currentData.config.timezones
    .map((tz) => `<option value="${tz}">${tz}</option>`)
    .join("");
  timezoneSelect.addEventListener("change", handleManualTimezoneChange);
  updateServerTimeDisplay();

  // Update timezone UI
  updateTimezoneUI();

  // Render time slot inputs
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const isMobile = window.innerWidth < 768;

  // Headers
  if (isMobile) {
    // Mobile: Show time slots as individual cards
    document.getElementById("timeSlotHeaders").innerHTML = `
                    <div style="margin-bottom: 20px;">
                        ${days
                          .map(
                            (day) => `
                            <div style="margin-bottom: 25px;">
                                <h4 style="color: #4a9eff; margin-bottom: 15px; text-align: center; font-size: 1.1em;">${t(
                                  day
                                )}</h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    ${TIME_SLOTS.map((slot) => {
                                      const isActive =
                                        userSelections[day] &&
                                        userSelections[day].includes(slot.id);
                                      const disabledClass = !isTimezoneConfirmed
                                        ? "disabled"
                                        : "";
                                      const disabledAttr = !isTimezoneConfirmed
                                        ? 'disabled="true"'
                                        : "";
                                      return `
                                            <div class="time-slot-btn ${
                                              isActive ? "active" : ""
                                            } ${disabledClass}" 
                                                 data-day="${day}" 
                                                 data-slot="${slot.id}"
                                                 onclick="toggleTimeSlot('${day}', '${
                                        slot.id
                                      }')"
                                                 ${disabledAttr}
                                                 style="padding: 15px 10px; min-height: 60px; font-size: 13px; font-weight: 600;">
                                                ${slot.name}
                                            </div>
                                        `;
                                    }).join("")}
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `;
    document.getElementById("timeSlotInputs").innerHTML = "";
  } else {
    // Desktop: Show all slots in a clean grid with times visible
    document.getElementById("timeSlotHeaders").innerHTML = "";

    document.getElementById("timeSlotInputs").innerHTML = days
      .map(
        (day) => `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4a9eff; margin-bottom: 15px; font-size: 1.1em;">${t(
                          day
                        )}</h4>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                            ${TIME_SLOTS.map((slot) => {
                              const isActive =
                                userSelections[day] &&
                                userSelections[day].includes(slot.id);
                              const disabledClass = !isTimezoneConfirmed
                                ? "disabled"
                                : "";
                              const disabledAttr = !isTimezoneConfirmed
                                ? 'disabled="true"'
                                : "";
                              return `
                                    <div class="time-slot-btn ${
                                      isActive ? "active" : ""
                                    } ${disabledClass}" 
                                         data-day="${day}" 
                                         data-slot="${slot.id}"
                                         onclick="toggleTimeSlot('${day}', '${
                                slot.id
                              }')"
                                         ${disabledAttr}
                                         style="padding: 12px 8px; min-height: 50px; font-size: 14px; font-weight: 600;">
                                        ${slot.name}
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `
      )
      .join("");
  }

  // Render members
  renderMembers();

  // Render timeline
  renderTimeline();
}

function renderMembers() {
  const memberCount = currentData.members.length;
  const title = document.getElementById("allianceMembersTitle");
  title.textContent = `${t("allianceMembers")} (${memberCount})`;

  const grid = document.getElementById("membersGrid");
  const allMembers = currentData.members.sort((a, b) => b.carPower - a.carPower);
  
  grid.innerHTML = allMembers
    .map(
      (member) => `
                <div class="member-card" data-username="${member.username.toLowerCase()}">
                    <h3>${member.username}</h3>
                    <div class="stats">
                        <span class="power">${t(
                          "power"
                        )}: ${member.carPower.toLocaleString()}</span> | 
                        <span class="tower">${t("tower")}: ${
        member.towerLevel
      }</span>
                    </div>
                    <div class="stats">${t("timezone")}: ${
        member.timezone
      }</div>
                    <button class="timeslots-toggle" onclick="toggleTimeslots(${member.id})" data-member-id="${member.id}">
                        <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <div class="time-slots collapsed" data-member-id="${member.id}">
                        ${Object.entries(member.availability || {})
                          .map(([day, slots]) => {
                            const slotNames = slots.map((slotId) => {
                              const slot = TIME_SLOTS.find(
                                (s) => s.id === slotId
                              );
                              return slot ? slot.name : slotId;
                            });
                            return `<div><strong>${t(
                              day
                            )}:</strong> ${slotNames.join(", ")}</div>`;
                          })
                          .join("")}
                    </div>
                    ${
                      isAuthenticated
                        ? `<button class="delete-btn" onclick="showDeleteModal(${member.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                           </button>`
                        : ""
                    }
                </div>
            `
    )
    .join("");
}

function filterMembers() {
  const searchInput = document.getElementById("memberSearchInput");
  const searchTerm = searchInput.value.toLowerCase().trim();
  const memberCards = document.querySelectorAll('.member-card');
  
  memberCards.forEach(card => {
    const username = card.getAttribute('data-username');
    if (username.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Toggle timeslots visibility for member cards
function toggleTimeslots(memberId) {
  const toggleButton = document.querySelector(`.timeslots-toggle[data-member-id="${memberId}"]`);
  const timeSlotsDiv = document.querySelector(`.time-slots[data-member-id="${memberId}"]`);
  const toggleIcon = toggleButton.querySelector('.toggle-icon');
  
  if (timeSlotsDiv && toggleButton) {
    const isCollapsed = timeSlotsDiv.classList.contains('collapsed');
    
    if (isCollapsed) {
      // Expand - show minus icon (remove horizontal line)
      timeSlotsDiv.classList.remove('collapsed');
      toggleButton.classList.add('expanded');
      toggleIcon.innerHTML = `
        <line x1="5" y1="12" x2="19" y2="12"></line>
      `;
    } else {
      // Collapse - show plus icon (restore both lines)
      timeSlotsDiv.classList.add('collapsed');
      toggleButton.classList.remove('expanded');
      toggleIcon.innerHTML = `
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      `;
    }
  }
}

// Tab switching functionality
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Save active tab to localStorage
  localStorage.setItem('activeTab', tabName);
}

// Initialize tab on page load
function initializeTabs() {
  const savedTab = localStorage.getItem('activeTab');
  if (savedTab && document.getElementById(`${savedTab}-tab`)) {
    switchTab(savedTab);
  } else {
    // Default to submit-info tab
    switchTab('submit-info');
  }
}

function renderTimeline() {
  const view = document.getElementById("timelineView");
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const isMobile = window.innerWidth < 768;

  // Count members available in each server time slot (converted from their local time)
  const availability = {};
  days.forEach((day) => {
    availability[day] = {};
    TIME_SLOTS.forEach((slot) => {
      availability[day][slot.id] = 0;

      // For each member, check if they're available in this server time slot
      currentData.members.forEach((member) => {
        if (member.availability[day]) {
          // Convert member's local slots to server time slots
          const memberServerTimeSlots = convertSlotsToServerTime(
            member.availability[day],
            member.timezone
          );
          if (memberServerTimeSlots.includes(slot.id)) {
            availability[day][slot.id]++;
          }
        }
      });
    });
  });

  if (isMobile) {
    // Mobile view - simplified
    view.innerHTML = `
                    <div style="margin-top: 20px;">
                        <p style="text-align: center; color: #888; margin-bottom: 20px;">Member availability by time slot (converted to server time UTC-2)</p>
                        ${days
                          .map((day) => {
                            const maxCount = Math.max(
                              ...Object.values(availability[day])
                            );
                            const bestSlots = TIME_SLOTS.filter(
                              (slot) =>
                                availability[day][slot.id] === maxCount &&
                                maxCount > 0
                            );
                            return `
                                <div style="background: #161625; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                                    <h4 style="color: #4a9eff; text-transform: capitalize; margin-bottom: 10px;">${day}</h4>
                                    ${
                                      bestSlots.length > 0
                                        ? `
                                        <p style="color: #44ff44;">Best server time: ${bestSlots
                                          .map((s) => s.name)
                                          .join(", ")}</p>
                                        <p style="color: #888; font-size: 14px;">${maxCount} members available</p>
                                    `
                                        : `
                                        <p style="color: #888;">No members available</p>
                                    `
                                    }
                                </div>
                            `;
                          })
                          .join("")}
                    </div>
                `;
  } else {
    // Desktop view - full grid
    view.innerHTML = `
                    <div style="margin-top: 20px; overflow-x: auto;">
                        <div style="text-align: center; color: #888; margin-bottom: 20px; font-size: 14px;">
                          <p style="margin-bottom: 10px;">${t(
                            "memberAvailabilityScale"
                          )}</p>
                          <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                            <span style="background: #cc2936; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">0-5: ${t(
                              "critical"
                            )}</span>
                            <span style="background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">6-9: ${t(
                              "low"
                            )}</span>
                            <span style="background: #f7b32b; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 12px;">10-12: ${t(
                              "moderate"
                            )}</span>
                            <span style="background: #44ff44; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 12px;">13-15: ${t(
                              "good"
                            )}</span>
                            <span style="background: #28a745; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">16+: ${t(
                              "excellent"
                            )}</span>
                          </div>
                        </div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="padding: 10px; text-align: left;">Day</th>
                                ${TIME_SLOTS.map(
                                  (slot) =>
                                    `<th style="padding: 5px; text-align: center; font-size: 12px; color: #4a9eff;">${slot.name}</th>`
                                ).join("")}
                            </tr>
                            ${days
                              .map(
                                (day) => `
                                <tr>
                                    <td style="padding: 10px; text-transform: capitalize; font-weight: 500; color: #888;">${t(
                                      day
                                    )}</td>
                                    ${TIME_SLOTS.map((slot) => {
                                      const count = availability[day][slot.id];

                                      // Multi-level color system
                                      let backgroundColor, textColor;
                                      if (count === 0) {
                                        backgroundColor = "#0a0a0a";
                                        textColor = "#666";
                                      } else if (count <= 5) {
                                        // Critical shortage - Red
                                        backgroundColor = "#cc2936";
                                        textColor = "#fff";
                                      } else if (count <= 9) {
                                        // Low availability - Orange
                                        backgroundColor = "#ff6b35";
                                        textColor = "#fff";
                                      } else if (count <= 12) {
                                        // Moderate availability - Yellow
                                        backgroundColor = "#f7b32b";
                                        textColor = "#000";
                                      } else if (count <= 15) {
                                        // Good availability - Light Green
                                        backgroundColor = "#44ff44";
                                        textColor = "#000";
                                      } else {
                                        // Excellent availability - Dark Green
                                        backgroundColor = "#28a745";
                                        textColor = "#fff";
                                      }

                                      return `
                                            <td style="
                                                background: ${backgroundColor};
                                                color: ${textColor};
                                                padding: 10px;
                                                text-align: center;
                                                border: 1px solid #333;
                                                font-size: 12px;
                                                font-weight: 600;
                                            ">
                                                ${count}
                                            </td>
                                        `;
                                    }).join("")}
                                </tr>
                            `
                              )
                              .join("")}
                        </table>
                    </div>
                `;
  }
}

function showMessage(text, type) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Get appropriate icon based on type
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  else if (type === "error") icon = "❌";
  else if (type === "info") icon = "ℹ️";

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${text}</div>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Trigger slide-in animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Auto-remove after 2 seconds
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400); // Wait for slide-out animation
  }, 2000);
}

function showLoading(show) {
  const skeletonContainer = document.getElementById("skeletonContainer");
  const mainContainer = document.querySelector(
    ".container:not(.skeleton-container .container)"
  );

  if (show) {
    // Show skeleton loading
    skeletonContainer.classList.add("show");
    if (mainContainer) {
      mainContainer.style.display = "none";
    }
  } else {
    // Hide skeleton, show main content
    skeletonContainer.classList.remove("show");
    if (mainContainer) {
      mainContainer.style.display = "block";
    }
  }
}

// Language switching functions
function toggleLanguageMenu() {
  const menu = document.getElementById("languageMenu");
  const btn = document.getElementById("languageBtn");

  menu.classList.toggle("show");
  btn.classList.toggle("active");

  // Close menu when clicking outside
  if (menu.classList.contains("show")) {
    setTimeout(() => {
      document.addEventListener("click", closeLanguageMenuOnOutsideClick);
    }, 10);
  }
}

function closeLanguageMenuOnOutsideClick(event) {
  const menu = document.getElementById("languageMenu");
  const btn = document.getElementById("languageBtn");

  if (!menu.contains(event.target) && !btn.contains(event.target)) {
    menu.classList.remove("show");
    btn.classList.remove("active");
    document.removeEventListener("click", closeLanguageMenuOnOutsideClick);
  }
}

// Mobile settings panel functions
function toggleMobileSettings() {
  const panel = document.getElementById("mobileSettingsPanel");
  panel.classList.toggle("show");

  // Close panel when clicking outside
  if (panel.classList.contains("show")) {
    setTimeout(() => {
      document.addEventListener("click", closeMobileSettingsOnOutsideClick);
    }, 10);
  }
}

function closeMobileSettingsOnOutsideClick(event) {
  const panel = document.getElementById("mobileSettingsPanel");
  const btn = document.getElementById("mobileSettingsBtn");

  if (!panel.contains(event.target) && !btn.contains(event.target)) {
    panel.classList.remove("show");
    document.removeEventListener("click", closeMobileSettingsOnOutsideClick);
  }
}

// Override changeLanguage to also close mobile panel
function changeLanguage(langCode) {
  if (translations[langCode]) {
    currentLanguage = langCode;
    localStorage.setItem("selectedLanguage", langCode);

    // Update flag display
    const flagElement = document.getElementById("currentFlag");
    if (flagElement && languages[langCode]) {
      flagElement.innerHTML = languages[langCode].flag;
    }

    // Close desktop menu
    const menu = document.getElementById("languageMenu");
    const btn = document.getElementById("languageBtn");
    if (menu && btn) {
      menu.classList.remove("show");
      btn.classList.remove("active");
    }

    // Close mobile panel
    const mobilePanel = document.getElementById("mobileSettingsPanel");
    if (mobilePanel) {
      mobilePanel.classList.remove("show");
    }

    // Update all translations
    updateAllTranslations();

    // Show success message
    showMessage(t("languageChanged"), "success");
  }
}

// Initialize language on page load
function initializeLanguage() {
  // Set current language flag
  const flagElement = document.getElementById("currentFlag");
  if (flagElement && languages[currentLanguage]) {
    flagElement.innerHTML = languages[currentLanguage].flag;
  }

  // Apply initial translations
  updateAllTranslations();
}

// Custom Modal Functions
function showCustomAlert(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const titleEl = document.getElementById("customModalTitle");
    const messageEl = document.getElementById("customModalMessage");
    const inputContainer = document.getElementById("customModalInput");
    const buttonsContainer = document.getElementById("customModalButtons");
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    inputContainer.style.display = "none";
    
    buttonsContainer.innerHTML = `
      <button class="btn btn-primary" onclick="closeCustomModal()">✅ OK</button>
    `;
    
    modal.classList.add("active");
    
    // Close modal when clicking outside of content
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeCustomModal();
      }
    };
    
    // Store resolver for when modal is closed
    modal._resolver = resolve;
  });
}

function showCustomConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const titleEl = document.getElementById("customModalTitle");
    const messageEl = document.getElementById("customModalMessage");
    const inputContainer = document.getElementById("customModalInput");
    const buttonsContainer = document.getElementById("customModalButtons");
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    inputContainer.style.display = "none";
    
    buttonsContainer.innerHTML = `
      <button class="btn btn-success" onclick="resolveCustomModal(true)">✅ Yes</button>
      <button class="btn" onclick="resolveCustomModal(false)">❌ Cancel</button>
    `;
    
    modal.classList.add("active");
    
    // Close modal when clicking outside of content (treat as cancel)
    modal.onclick = (e) => {
      if (e.target === modal) {
        resolveCustomModal(false);
      }
    };
    
    // Store resolver for when modal is closed
    modal._resolver = resolve;
  });
}

function showCustomPrompt(title, message, defaultValue = "") {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const titleEl = document.getElementById("customModalTitle");
    const messageEl = document.getElementById("customModalMessage");
    const inputContainer = document.getElementById("customModalInput");
    const inputField = document.getElementById("customModalInputField");
    const buttonsContainer = document.getElementById("customModalButtons");
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    inputContainer.style.display = "block";
    inputField.value = defaultValue;
    
    buttonsContainer.innerHTML = `
      <button class="btn btn-success" onclick="resolveCustomModalWithInput()">✅ OK</button>
      <button class="btn" onclick="resolveCustomModal(null)">❌ Cancel</button>
    `;
    
    modal.classList.add("active");
    
    // Close modal when clicking outside of content (treat as cancel)
    modal.onclick = (e) => {
      if (e.target === modal) {
        resolveCustomModal(null);
      }
    };
    
    // Focus the input field after a brief delay for animation
    setTimeout(() => {
      inputField.focus();
      inputField.select();
    }, 100);
    
    // Handle Enter key for OK
    inputField.onkeydown = (e) => {
      if (e.key === "Enter") {
        resolveCustomModalWithInput();
      } else if (e.key === "Escape") {
        resolveCustomModal(null);
      }
    };
    
    // Store resolver for when modal is closed
    modal._resolver = resolve;
  });
}

function closeCustomModal() {
  const modal = document.getElementById("customModal");
  modal.classList.remove("active");
  modal.onclick = null; // Clean up event listener
  
  if (modal._resolver) {
    modal._resolver();
    modal._resolver = null;
  }
}

function resolveCustomModal(result) {
  const modal = document.getElementById("customModal");
  modal.classList.remove("active");
  modal.onclick = null; // Clean up event listener
  
  if (modal._resolver) {
    modal._resolver(result);
    modal._resolver = null;
  }
}

function resolveCustomModalWithInput() {
  const modal = document.getElementById("customModal");
  const inputField = document.getElementById("customModalInputField");
  const value = inputField.value;
  
  modal.classList.remove("active");
  modal.onclick = null; // Clean up event listener
  inputField.onkeydown = null; // Clean up input listener
  
  if (modal._resolver) {
    modal._resolver(value);
    modal._resolver = null;
  }
}

// Initialize
if (authToken) {
  isAuthenticated = true;
  updateAuthStatus();
  // Hide auth section if already authenticated
  document.getElementById("authSection").classList.add("hidden");
}

// Initialize timezone handling
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for new language dropdown
  const langBtn = document.getElementById("languageBtn");
  if (langBtn) {
    langBtn.addEventListener("click", toggleLanguageMenu);
  }

  document.querySelectorAll(".language-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const lang = e.currentTarget.dataset.lang;
      if (lang) {
        changeLanguage(lang);
      }
    });
  });
  // Initialize language system
  initializeLanguage();

  // Initialize tabs
  initializeTabs();

  // Check if timezone was previously confirmed
  if (!isTimezoneConfirmed) {
    // Show timezone modal after a short delay
    setTimeout(() => {
      showTimezoneModal();
    }, 1000);
  }
});

loadData();

// Auto-refresh every 5 minutes to avoid disrupting user input
setInterval(loadData, 300000);

// Re-render on window resize for responsive layout
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (currentData) renderUI();
  }, 250);
});

// ===== REGISTRATION SYSTEM FUNCTIONS =====

// Handle registration form submission
async function handleRegistrationSubmit(event) {
  event.preventDefault();
  
  // Collect form data
  const formData = {
    username: document.getElementById('regUsername').value.trim(),
    carPower: parseInt(document.getElementById('regCarPower').value),
    towerLevel: parseInt(document.getElementById('regTowerLevel').value),
    dailyPoints: parseInt(document.getElementById('regDailyPoints').value),
    exAlliances: document.getElementById('regExAlliances').value.trim(),
    whyLeft: document.getElementById('regWhyLeft').value.trim(),
    whyJoin: document.getElementById('regWhyJoin').value.trim(),
    motivation: document.getElementById('regMotivation').value.trim()
  };

  // Validate required fields
  if (!formData.username || !formData.carPower || !formData.towerLevel || 
      !formData.dailyPoints || !formData.whyJoin || !formData.motivation) {
    showMessage(t("fillAllFields"), "error");
    return;
  }

  // Show confirmation modal
  const confirmed = await showRegistrationConfirmation(formData);
  if (!confirmed) return;

  // Submit registration
  await submitRegistration(formData);
}

// Show registration confirmation modal
function showRegistrationConfirmation(formData) {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const titleEl = document.getElementById("customModalTitle");
    const messageEl = document.getElementById("customModalMessage");
    const inputContainer = document.getElementById("customModalInput");
    const buttonsContainer = document.getElementById("customModalButtons");
    
    titleEl.textContent = "📋 Confirm Registration Application";
    messageEl.innerHTML = `
      <div style="text-align: left; background: rgba(10, 10, 10, 0.5); padding: 20px; border-radius: 10px; margin: 15px 0;">
        <h4 style="color: #4a9eff; margin-bottom: 15px;">Review Your Information:</h4>
        <p><strong>Username:</strong> ${formData.username}</p>
        <p><strong>Car Power:</strong> ${formData.carPower.toLocaleString()}</p>
        <p><strong>Tower Level:</strong> ${formData.towerLevel}</p>
        <p><strong>Daily VS Points:</strong> ${formData.dailyPoints.toLocaleString()}</p>
        <p><strong>Previous Alliances:</strong> ${formData.exAlliances || 'None specified'}</p>
        <p><strong>Reason for leaving:</strong> ${formData.whyLeft || 'N/A'}</p>
        <p><strong>Why join TDC:</strong> ${formData.whyJoin}</p>
        <p><strong>Motivation:</strong> ${formData.motivation}</p>
      </div>
      <p style="color: #ffcc00; font-weight: bold;">Are you sure you want to submit this application?</p>
    `;
    inputContainer.style.display = "none";
    
    buttonsContainer.innerHTML = `
      <button class="btn btn-success" onclick="resolveCustomModal(true)">✅ Submit Application</button>
      <button class="btn" onclick="resolveCustomModal(false)">❌ Cancel</button>
    `;
    
    modal.classList.add("active");
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        resolveCustomModal(false);
      }
    };
    
    modal._resolver = resolve;
  });
}

// Submit registration to GitHub
async function submitRegistration(formData) {
  showLoading(true);
  
  try {
    // Prepare registration data
    const registrationData = {
      id: Date.now(),
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'pending' // pending, approved, declined
    };

    // Initialize registrations array if it doesn't exist
    if (!currentData.registrations) {
      currentData.registrations = [];
    }

    // Add to registrations
    currentData.registrations.push(registrationData);
    
    // Save to GitHub using the hardcoded token
    await saveRegistrationData();
    
    showMessage("Registration application submitted successfully! You will be notified once it's reviewed.", "success");
    
    // Clear form
    document.getElementById('registrationForm').reset();
    
  } catch (error) {
    showMessage(`Error submitting registration: ${error.message}`, "error");
  }
  
  showLoading(false);
}

// Save registration data to GitHub
async function saveRegistrationData() {
  try {
    const token = getRegistrationToken();
    if (!token) {
      throw new Error("Registration token is required");
    }

    currentData.lastUpdated = new Date().toISOString();
    const content = btoa(JSON.stringify(currentData, null, 2));

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Add new registration application",
          content: content,
          sha: currentData.sha,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to save registration");

    const result = await response.json();
    currentData.sha = result.content.sha;
  } catch (error) {
    throw new Error(`Failed to save registration: ${error.message}`);
  }
}

// Request admin access
async function requestAdminAccess() {
  const password = await showCustomPrompt(
    "🔒 Admin Access Required",
    "Enter the admin password to view pending applications:"
  );

  if (password === ADMIN_PASSWORD) {
    showPendingApplications();
  } else if (password !== null) {
    showMessage("Incorrect admin password", "error");
  }
}

// Show pending applications
function showPendingApplications() {
  const listContainer = document.getElementById("pendingApplicationsList");
  const grid = document.getElementById("applicationsGrid");
  
  if (!currentData.registrations) {
    currentData.registrations = [];
  }
  
  const pendingApps = currentData.registrations.filter(app => app.status === 'pending');
  
  if (pendingApps.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; color: #888; padding: 20px;">
        <p>No pending applications</p>
      </div>
    `;
  } else {
    grid.innerHTML = pendingApps.map(app => `
      <div class="member-card" style="position: relative;">
        <h3>${app.username}</h3>
        <div class="stats">
          <span class="power">Power: ${app.carPower.toLocaleString()}</span> | 
          <span class="tower">Tower: ${app.towerLevel}</span>
        </div>
        <div class="stats">Daily VS Points: ${app.dailyPoints.toLocaleString()}</div>
        <div style="background: rgba(10, 10, 10, 0.6); padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px;">
          <p><strong>Previous Alliances:</strong> ${app.exAlliances || 'None'}</p>
          <p><strong>Reason for leaving:</strong> ${app.whyLeft || 'N/A'}</p>
          <p><strong>Why join TDC:</strong> ${app.whyJoin}</p>
          <p><strong>Motivation:</strong> ${app.motivation}</p>
        </div>
        <div class="stats" style="font-size: 11px; color: #888;">
          Submitted: ${new Date(app.submittedAt).toLocaleDateString()}
        </div>
        <div style="margin-top: 15px; display: flex; gap: 10px;">
          <button 
            class="btn btn-success" 
            style="flex: 1; padding: 8px 12px; font-size: 12px;"
            onclick="handleApplicationAction(${app.id}, 'approved')"
          >
            ✅ Approve
          </button>
          <button 
            class="btn btn-danger" 
            style="flex: 1; padding: 8px 12px; font-size: 12px;"
            onclick="handleApplicationAction(${app.id}, 'declined')"
          >
            ❌ Decline
          </button>
        </div>
      </div>
    `).join('');
  }
  
  listContainer.style.display = 'block';
}

// Handle approve/decline actions
async function handleApplicationAction(appId, action) {
  // Request admin password again for security
  const password = await showCustomPrompt(
    "🔒 Confirm Action",
    `Enter admin password to ${action === 'approved' ? 'approve' : 'decline'} this application:`
  );

  if (password !== ADMIN_PASSWORD) {
    if (password !== null) {
      showMessage("Incorrect admin password", "error");
    }
    return;
  }

  showLoading(true);
  
  try {
    // Find and update the application
    const appIndex = currentData.registrations.findIndex(app => app.id === appId);
    if (appIndex !== -1) {
      currentData.registrations[appIndex].status = action;
      currentData.registrations[appIndex].reviewedAt = new Date().toISOString();
      
      // Save changes
      await saveRegistrationData();
      
      showMessage(`Application ${action === 'approved' ? 'approved' : 'declined'} successfully!`, "success");
      
      // Refresh the applications list
      showPendingApplications();
    }
  } catch (error) {
    showMessage(`Error updating application: ${error.message}`, "error");
  }
  
  showLoading(false);
}
