const REPO_OWNER = "wissamyah";
const REPO_NAME = "dws-alliance-scheduler";
const DATA_FILE = "data.json";

let authToken = localStorage.getItem("githubToken");
let isAuthenticated = false;
let currentData = null;
let userSelections = JSON.parse(localStorage.getItem("timeSlotSelections")) || {};

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
    const localDate = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
    
    // Get the current UTC date
    const utcDate = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
    
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
      utc: utcString
    };
    
    console.log("Detected timezone:", detectedTimezone);
    return detectedTimezone;
  } catch (e) {
    console.error("Timezone detection failed:", e);
    // Fallback to UTC if detection fails
    detectedTimezone = {
      iana: "UTC",
      offset: 0,
      utc: "UTC"
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
      hour: '2-digit',
      minute: '2-digit'
    });
    
    document.getElementById("userLocalTime").textContent = userTimeString;
    
    // Format timezone display better
    const timezoneDisplay = `${detectedTimezone.iana} (${detectedTimezone.utc})`;
    document.getElementById("userTimezone").textContent = timezoneDisplay;
  } catch (e) {
    console.error("Error formatting user time:", e);
    const fallbackTime = now.toTimeString().slice(0, 5);
    document.getElementById("userLocalTime").textContent = fallbackTime;
    document.getElementById("userTimezone").textContent = `${detectedTimezone.iana} (${detectedTimezone.utc})`;
  }
  
  // Server time (UTC-2)
  const serverOffset = -2;
  try {
    const serverTimeString = now.toLocaleString("en-US", {
      timeZone: "Etc/GMT+2", // Note: GMT+2 means UTC-2 (confusing but correct)
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    document.getElementById("serverTime").textContent = serverTimeString;
  } catch (e) {
    // Fallback calculation
    const serverTime = new Date();
    serverTime.setHours(serverTime.getUTCHours() + serverOffset);
    document.getElementById("serverTime").textContent = serverTime.toTimeString().slice(0, 5);
  }
  
  // Time relationship - this was the bug
  const timeDiff = detectedTimezone.offset - serverOffset; // User offset minus server offset
  const diff = Math.abs(timeDiff);
  
  let relationshipText;
  if (timeDiff > 0) {
    relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? "s" : ""} ahead of server time`;
  } else if (timeDiff < 0) {
    relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? "s" : ""} behind server time`;
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
  showMessage("Timezone confirmed! You can now select your available time slots.", "success");
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
    
    document.getElementById("confirmedTimezoneText").textContent = 
      `Using ${confirmedTimezone} timezone`;
    
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
  timeSlotButtons.forEach(btn => {
    btn.classList.remove("disabled");
    btn.removeAttribute("disabled");
  });
  
  document.getElementById("submitBtn").disabled = false;
}

// Disable time slot selection
function disableTimeSlotSelection() {
  const timeSlotButtons = document.querySelectorAll(".time-slot-btn");
  timeSlotButtons.forEach(btn => {
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
  
  memberSlots.forEach(slotId => {
    const slot = TIME_SLOTS.find(s => s.id === slotId);
    if (slot) {
      // Convert each hour in the slot from local time to server time (UTC-2)
      slot.hours.forEach(localHour => {
        // Correct conversion: subtract timezone difference
        let serverHour = localHour - (timezoneOffset - serverOffset);
        
        // Handle day wrap-around
        if (serverHour < 0) {
          serverHour += 24;
        } else if (serverHour >= 24) {
          serverHour -= 24;
        }
        
        // Find which server time slot this hour belongs to
        const serverSlot = TIME_SLOTS.find(s => s.hours.includes(serverHour));
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
    relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? "s" : ""} ahead of server time`;
  } else if (timeDiff < 0) {
    relationshipText = `Your timezone is ${diff} hour${diff !== 1 ? "s" : ""} behind server time`;
  } else {
    relationshipText = `Your timezone matches server time`;
  }

  document.getElementById("serverTimeInfo").innerHTML = `${relationshipText}<br>
                 Current server time: ${serverTime.toTimeString().slice(0, 5)} (UTC-2)`;
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
    showMessage(`Timezone set to ${selectedTz}! You can now select your available time slots.`, "success");
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
    showMessage("Error loading data: " + error.message, "error");
  }
  showLoading(false);
}

async function saveData() {
  if (!isAuthenticated || !authToken) {
    showMessage("You must be authenticated to save data", "error");
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
    showMessage("Data saved successfully!", "success");
  } catch (error) {
    showMessage("Error saving data: " + error.message, "error");
  }
  showLoading(false);
}

function authenticate() {
  const token = document.getElementById("githubToken").value;
  if (!token) {
    showMessage("Please enter a GitHub token", "error");
    return;
  }
  authToken = token;
  localStorage.setItem("githubToken", token);
  isAuthenticated = true;
  updateAuthStatus();
  renderUI();
  showMessage("Authentication successful!", "success");

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
    authStatusEl.textContent = isAuthenticated ? "Authenticated" : "Not authenticated";
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
    showMessage("You must authenticate with a GitHub token before submitting your information!", "error");
    return;
  }

  // Check if timezone is confirmed
  if (!isTimezoneConfirmed || !confirmedTimezone) {
    showMessage("Please confirm your timezone before submitting your information!", "error");
    if (!isTimezoneConfirmed) {
      showTimezoneModal();
    }
    return;
  }

  const username = document.getElementById("username").value;
  const carPower = document.getElementById("carPower").value.replace(/[,\s]/g, '');
  const towerLevel = document.getElementById("towerLevel").value;

  if (!username || !carPower || !towerLevel) {
    showMessage("Please fill all required fields", "error");
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

  // Helper function to normalize username for comparison (remove spaces, convert to lowercase)
  function normalizeUsername(name) {
    return name.replace(/\s+/g, '').toLowerCase();
  }

  // Check if member with same username already exists (ignoring case and spaces)
  const normalizedInputUsername = normalizeUsername(username);
  const existingMemberIndex = currentData.members.findIndex(member => 
    normalizeUsername(member.username) === normalizedInputUsername
  );

  if (existingMemberIndex !== -1) {
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
      if (carPower.trim()) updatedFields.push("car power");
      if (towerLevel.trim()) updatedFields.push("tower level");
      
      showMessage(`${existingMember.username}'s ${updatedFields.join(" and ")} updated successfully!`, "success");
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
      showMessage(`${existingMember.username}'s information has been fully updated!`, "success");
    }
  } else {
    // New member - require all fields
    if (!carPower.trim() || !towerLevel.trim()) {
      showMessage("New members must provide car power and tower level", "error");
      return;
    }
    
    currentData.members.push(submission);
    showMessage("Member information submitted successfully!", "success");
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
    showMessage("Please confirm your timezone first!", "error");
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

function showDeleteModal(id) {
  // Ask for R5 password
  const password = prompt("Enter the R5 password to delete this member:");
  
  if (password === "R5") {
    deleteMember(id);
  } else if (password !== null) { // null means user cancelled
    showMessage("Incorrect password. Member not deleted.", "error");
  }
}

function deleteMember(id) {
  if (!isAuthenticated) {
    showMessage("You must be authenticated to delete members", "error");
    return;
  }
  
  // Get member info before deletion for the message
  const member = currentData.members.find(m => m.id === id);
  const memberName = member ? member.username : 'Member';
  
  currentData.members = currentData.members.filter((m) => m.id !== id);
  saveData();
  showMessage(`${memberName} has been removed from the alliance`, "success");
  
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
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
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
                                <h4 style="color: #4a9eff; margin-bottom: 15px; text-align: center; font-size: 1.1em;">${day}</h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    ${TIME_SLOTS.map((slot) => {
                                      const isActive =
                                        userSelections[day.toLowerCase()] &&
                                        userSelections[
                                          day.toLowerCase()
                                        ].includes(slot.id);
                                      const disabledClass = !isTimezoneConfirmed ? "disabled" : "";
                                      const disabledAttr = !isTimezoneConfirmed ? 'disabled="true"' : "";
                                      return `
                                            <div class="time-slot-btn ${
                                              isActive ? "active" : ""
                                            } ${disabledClass}" 
                                                 data-day="${day.toLowerCase()}" 
                                                 data-slot="${slot.id}"
                                                 onclick="toggleTimeSlot('${day.toLowerCase()}', '${
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
                        <h4 style="color: #4a9eff; margin-bottom: 15px; font-size: 1.1em;">${day}</h4>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                            ${TIME_SLOTS.map((slot) => {
                              const isActive =
                                userSelections[day.toLowerCase()] &&
                                userSelections[day.toLowerCase()].includes(
                                  slot.id
                                );
                              const disabledClass = !isTimezoneConfirmed ? "disabled" : "";
                              const disabledAttr = !isTimezoneConfirmed ? 'disabled="true"' : "";
                              return `
                                    <div class="time-slot-btn ${
                                      isActive ? "active" : ""
                                    } ${disabledClass}" 
                                         data-day="${day.toLowerCase()}" 
                                         data-slot="${slot.id}"
                                         onclick="toggleTimeSlot('${day.toLowerCase()}', '${
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
  title.textContent = `Alliance Members (${memberCount})`;

  const grid = document.getElementById("membersGrid");
  grid.innerHTML = currentData.members
    .map(
      (member) => `
                <div class="member-card">
                    <h3>${member.username}</h3>
                    <div class="stats">
                        <span class="power">Power: ${member.carPower.toLocaleString()}</span> | 
                        <span class="tower">Tower: ${member.towerLevel}</span>
                    </div>
                    <div class="stats">Timezone: ${member.timezone}</div>
                    <div class="time-slots">
                        ${Object.entries(member.availability || {})
                          .map(([day, slots]) => {
                            const slotNames = slots.map((slotId) => {
                              const slot = TIME_SLOTS.find(
                                (s) => s.id === slotId
                              );
                              return slot ? slot.name : slotId;
                            });
                            return `<div><strong>${day}:</strong> ${slotNames.join(
                              ", "
                            )}</div>`;
                          })
                          .join("")}
                    </div>
                    ${
                      isAuthenticated
                        ? `<button class="delete-btn" onclick="showDeleteModal(${member.id})">&times;</button>`
                        : ""
                    }
                </div>
            `
    )
    .join("");
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
          const memberServerTimeSlots = convertSlotsToServerTime(member.availability[day], member.timezone);
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
                        <p style="text-align: center; color: #888; margin-bottom: 20px;">Light green = more members available (times converted to server time UTC-2)</p>
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
                                    <td style="padding: 10px; text-transform: capitalize; font-weight: 500; color: #888;">${day}</td>
                                    ${TIME_SLOTS.map((slot) => {
                                      const count = availability[day][slot.id];
                                      const intensity = Math.min(
                                        count * 20,
                                        100
                                      );
                                      return `
                                            <td style="
                                                background: ${
                                                  count > 0
                                                    ? `rgba(68, 255, 68, ${
                                                        intensity / 100
                                                      })`
                                                    : "#0a0a0a"
                                                };
                                                color: ${
                                                  count > 0 ? "#000" : "#666"
                                                };
                                                padding: 10px;
                                                text-align: center;
                                                border: 1px solid #333;
                                                font-size: 12px;
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
  document.getElementById("loadingIndicator").style.display = show
    ? "block"
    : "none";
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
  // Check if timezone was previously confirmed
  if (!isTimezoneConfirmed) {
    // Show timezone modal after a short delay
    setTimeout(() => {
      showTimezoneModal();
    }, 1000);
  }
});

loadData();

// Auto-refresh every 2 minutes to avoid disrupting user input
setInterval(loadData, 120000);

// Re-render on window resize for responsive layout
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (currentData) renderUI();
  }, 250);
});