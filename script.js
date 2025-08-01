const REPO_OWNER = "wissamyah";
const REPO_NAME = "dws-alliance-scheduler";
const DATA_FILE = "data.json";

let authToken = localStorage.getItem("githubToken");
let isR4 = false;
let currentData = null;
let userSelections =
  JSON.parse(localStorage.getItem("timeSlotSelections")) || {};

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

// For mobile view, show 3 slots at a time
const MOBILE_SLOT_GROUPS = [
  { label: "Night", slots: ["slot1", "slot2", "slot3"] },
  { label: "Morning", slots: ["slot4", "slot5", "slot6"] },
  { label: "Afternoon", slots: ["slot7", "slot8", "slot9"] },
  { label: "Evening", slots: ["slot10", "slot11", "slot12"] },
];

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
  const ahead = timeDiff > 0 ? "ahead of" : "behind";
  const diff = Math.abs(timeDiff);

  document.getElementById(
    "serverTimeInfo"
  ).innerHTML = `Server time is ${diff} hour${
    diff !== 1 ? "s" : ""
  } ${ahead} your selected timezone<br>
                 Current server time: ${serverTime
                   .toTimeString()
                   .slice(0, 5)} (UTC-2)`;
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
  if (!isR4 || !authToken) {
    showMessage("Only R4s can save data", "error");
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

async function saveDataUnauthenticated() {
  showLoading(true);
  try {
    // For unauthenticated users, we'll create a GitHub issue instead
    const submission =
      currentData.pendingSubmissions[currentData.pendingSubmissions.length - 1];

    const issueBody = `
**New Member Submission**

**Username:** ${submission.username}
**Car Power:** ${submission.carPower.toLocaleString()}
**Tower Level:** ${submission.towerLevel}
**Timezone:** ${submission.timezone}
**Submitted At:** ${submission.submittedAt}

**Availability:**
${Object.entries(submission.availability || {})
  .map(([day, slots]) => {
    const slotNames = slots.map((slotId) => {
      const slot = TIME_SLOTS.find((s) => s.id === slotId);
      return slot ? slot.name : slotId;
    });
    return `- **${
      day.charAt(0).toUpperCase() + day.slice(1)
    }:** ${slotNames.join(", ")}`;
  })
  .join("\n")}

*This submission needs to be reviewed and approved by an R4.*
           `;

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `New Member Submission: ${submission.username}`,
          body: issueBody.trim(),
          labels: ["member-submission", "pending-review"],
        }),
      }
    );

    if (response.ok) {
      showMessage(
        "Your submission has been created as a GitHub issue for review!",
        "success"
      );
    } else {
      throw new Error("Failed to create submission issue");
    }
  } catch (error) {
    showMessage(
      "Submission saved locally but couldn't create GitHub issue. Please contact an R4.",
      "error"
    );
  }
  showLoading(false);
}

function authenticateR4() {
  const token = document.getElementById("githubToken").value;
  if (!token) {
    showMessage("Please enter a GitHub token", "error");
    return;
  }
  authToken = token;
  localStorage.setItem("githubToken", token);
  isR4 = true;
  updateAuthStatus();
  renderUI();
  showMessage("Authenticated as R4!", "success");

  // Hide auth section for R4s
  document.getElementById("authSection").classList.add("hidden");
}

function logout() {
  authToken = null;
  isR4 = false;
  localStorage.removeItem("githubToken");
  document.getElementById("githubToken").value = "";
  updateAuthStatus();
  renderUI();

  // Show auth section again
  document.getElementById("authSection").classList.remove("hidden");
}

function updateAuthStatus() {
  const isAuthenticated = isR4;
  document.getElementById("authStatus").textContent = isAuthenticated
    ? "Authenticated as R4"
    : "Not authenticated";
  document
    .getElementById("pendingSection")
    .classList.toggle("hidden", !isAuthenticated);
  document.getElementById("authControls").style.display = isAuthenticated
    ? "none"
    : "block";
  document.getElementById("logoutBtn").style.display = isAuthenticated
    ? "inline-block"
    : "none";
}

function submitMemberInfo() {
  const username = document.getElementById("username").value;
  const carPower = document.getElementById("carPower").value;
  const towerLevel = document.getElementById("towerLevel").value;
  const timezone = document.getElementById("timezone").value;

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
    timezone,
    availability: timeSlots,
    submittedAt: new Date().toISOString(),
  };

  if (isR4) {
    currentData.members.push(submission);
    saveData();
    showMessage("Member added successfully!", "success");
  } else {
    currentData.pendingSubmissions.push(submission);
    // For non-R4 users, we need to save without authentication
    saveDataUnauthenticated();
    showMessage("Your information has been submitted for review!", "success");
  }

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
  const btn = document.querySelector(
    `[data-day="${day}"][data-slot="${slotId}"]`
  );
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

function approvePending(id) {
  const pending = currentData.pendingSubmissions.find((p) => p.id === id);
  if (pending) {
    currentData.members.push(pending);
    currentData.pendingSubmissions = currentData.pendingSubmissions.filter(
      (p) => p.id !== id
    );
    saveData();
  }
}

function rejectPending(id) {
  currentData.pendingSubmissions = currentData.pendingSubmissions.filter(
    (p) => p.id !== id
  );
  saveData();
}

function deleteMember(id) {
  if (!isR4) return;
  currentData.members = currentData.members.filter((m) => m.id !== id);
  saveData();
}

function renderUI() {
  if (!currentData) return;

  // Populate timezone dropdown
  const timezoneSelect = document.getElementById("timezone");
  timezoneSelect.innerHTML = currentData.config.timezones
    .map((tz) => `<option value="${tz}">${tz}</option>`)
    .join("");
  timezoneSelect.addEventListener("change", updateServerTimeDisplay);
  updateServerTimeDisplay();

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
                                      return `
                                            <div class="time-slot-btn ${
                                              isActive ? "active" : ""
                                            }" 
                                                 data-day="${day.toLowerCase()}" 
                                                 data-slot="${slot.id}"
                                                 onclick="toggleTimeSlot('${day.toLowerCase()}', '${
                                        slot.id
                                      }')"
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
                              return `
                                    <div class="time-slot-btn ${
                                      isActive ? "active" : ""
                                    }" 
                                         data-day="${day.toLowerCase()}" 
                                         data-slot="${slot.id}"
                                         onclick="toggleTimeSlot('${day.toLowerCase()}', '${
                                slot.id
                              }')"
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

  // Render pending (for R4s)
  if (isR4) {
    renderPending();
  }

  // Render timeline
  renderTimeline();
}

function renderMembers() {
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
                      isR4
                        ? `<button class="delete-btn" onclick="showDeleteModal(${member.id})">&times;</button>`
                        : ""
                    }
                </div>
            `
    )
    .join("");
}

function renderPending() {
  const list = document.getElementById("pendingList");
  list.innerHTML = currentData.pendingSubmissions
    .map(
      (sub) => `
                <div class="pending-item">
                    <div>
                        <strong>${
                          sub.username
                        }</strong> - Power: ${sub.carPower.toLocaleString()}, Tower: ${
        sub.towerLevel
      }
                    </div>
                    <div>
                        <button class="btn btn-success" onclick="approvePending(${
                          sub.id
                        })">Approve</button>
                        <button class="btn btn-danger" onclick="rejectPending(${
                          sub.id
                        })">Reject</button>
                    </div>
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

  // Count members available in each slot
  const availability = {};
  days.forEach((day) => {
    availability[day] = {};
    TIME_SLOTS.forEach((slot) => {
      availability[day][slot.id] = currentData.members.filter(
        (m) => m.availability[day] && m.availability[day].includes(slot.id)
      ).length;
    });
  });

  if (isMobile) {
    // Mobile view - simplified
    view.innerHTML = `
                    <div style="margin-top: 20px;">
                        <p style="text-align: center; color: #888; margin-bottom: 20px;">Member availability by time slot</p>
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
                                        <p style="color: #44ff44;">Best time: ${bestSlots
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
                        <p style="text-align: center; color: #888; margin-bottom: 20px;">Light green = more members available</p>
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
  const area = document.getElementById("messageArea");
  area.innerHTML = `<div class="message ${type}">${text}</div>`;
  setTimeout(() => (area.innerHTML = ""), 5000);
}

function showLoading(show) {
  document.getElementById("loadingIndicator").style.display = show
    ? "block"
    : "none";
}

// Initialize
if (authToken) {
  isR4 = true;
  updateAuthStatus();
  // Hide auth section if already authenticated
  document.getElementById("authSection").classList.add("hidden");
}
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

// Modal Handling
const modal = document.getElementById("confirmationModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
let memberIdToDelete = null;

function showDeleteModal(id) {
  memberIdToDelete = id;
  modal.classList.add("active");
}

function hideDeleteModal() {
  memberIdToDelete = null;
  modal.classList.remove("active");
}

confirmDeleteBtn.addEventListener("click", () => {
  if (memberIdToDelete !== null) {
    deleteMember(memberIdToDelete);
    hideDeleteModal();
  }
});

cancelDeleteBtn.addEventListener("click", hideDeleteModal);

// Close modal if clicking outside of it
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    hideDeleteModal();
  }
});
