let stepsCount = 1;

let next = document.querySelectorAll(".next-btn");
let back = document.querySelectorAll(".back-btn");

next.forEach(function (btn) {

    btn.addEventListener("click", function () {
        if (!validateOnboardingStep(stepsCount)) return;
        let currentStep = document.getElementById(`step-${stepsCount}`);
        currentStep.classList.remove('active');

        stepsCount++;

        let nextStep = document.getElementById(`step-${stepsCount}`);
        nextStep.classList.add('active');
    });

});

back.forEach(function (btn) {

    btn.addEventListener("click", function () {
        let currentStep = document.getElementById(`step-${stepsCount}`);
        currentStep.classList.remove('active');

        stepsCount--;

        let prevStep = document.getElementById(`step-${stepsCount}`);
        prevStep.classList.add('active');
    });
});

function saveInformation() {

    let priorityCard = document.querySelectorAll(".priority-card");

    let priorities = [];

    priorityCard.forEach(function (card) {
        const input = card.querySelector("input");
        if (input?.checked) {
            priorities.push(input.value);
        }
    });

    const user = {
        name: document.getElementById("name").value.trim(),
        role: document.getElementById("role").value.trim(),
        location: document.getElementById("location").value.trim(),

        priorities: priorities,

        wakeUp: document.getElementById("wake-up").value.trim(),
        work: document.getElementById("work").value.trim(),
        gym: document.getElementById("gym").value.trim(),
        focus: document.getElementById("focus").value.trim(),
        sleep: document.getElementById("sleep").value.trim(),
    };

    saveUser(user);
    localStorage.setItem("onboardingComplete", "true");

}

let dashboardBtn = document.getElementById("dashboard-btn");

if (dashboardBtn) {
    dashboardBtn.addEventListener("click", function (event) {
        event.preventDefault();
        if (!validateOnboardingStep(4) || !validateOnboardingStep(3) || !validateOnboardingStep(2) || !validateOnboardingStep(1)) return;
        saveInformation();
        window.location.href = "./pages/dashboard.html";
    });
}

function updateTimeDate() {
    const now = new Date();
    const dateElement = document.getElementById("current-date");
    const timeElement = document.getElementById("current-time");
    if (!dateElement || !timeElement) return;

    const date = now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : now.getHours() < 22 ? "Good evening" : "Good night";
    dateElement.textContent = date;
    timeElement.textContent = `${greeting} · ${time}`;
}

updateTimeDate();

setInterval(updateTimeDate, 1000);

let userName = document.getElementById("user-name");

if (userName) {

    const user = loadUser();
    userName.textContent = user?.name || "there";
}

function validateOnboardingStep(step) {
    const required = {
        1: ["name", "role", "location"],
        2: [],
        3: ["wake-up", "work", "gym", "focus", "sleep"],
        4: []
    }[step] || [];
    const missing = required.some(id => !document.getElementById(id)?.value.trim());
    if (missing) {
        const firstMissing = required.find(id => !document.getElementById(id)?.value.trim());
        document.getElementById(firstMissing)?.focus();
        return false;
    }
    return true;
}

const defaultDashboardData = {
    periods: {
        week: {
            productivity: [65, 72, 58, 81, 76, 88, 92],
            focus: [2.2, 2.9, 3.5, 2.6, 3.1, 1.8, 1.3],
            tasks: { completed: 18, inProgress: 3, pending: 2, overdue: 1 },
            goals: [68, 42, 76],
            habits: { completed: 5, total: 7 },
            streak: 6
        },
        today: {
            productivity: [92], focus: [1.3],
            tasks: { completed: 3, inProgress: 1, pending: 1, overdue: 0 },
            goals: [68, 42, 76], habits: { completed: 1, total: 1 }, streak: 1
        },
        lastWeek: {
            productivity: [58, 64, 61, 70, 68, 74, 79],
            focus: [1.8, 2.4, 2.8, 2.1, 2.7, 1.4, 1.1],
            tasks: { completed: 15, inProgress: 4, pending: 3, overdue: 2 },
            goals: [61, 35, 69], habits: { completed: 4, total: 7 }, streak: 4
        },
        month: {
            productivity: [68, 71, 74, 77], focus: [12.4, 14.1, 13.8, 15.2],
            tasks: { completed: 68, inProgress: 8, pending: 7, overdue: 3 },
            goals: [68, 42, 76], habits: { completed: 21, total: 28 }, streak: 6
        }
    },
    timeDistribution: { Work: 42, Study: 22, Exercise: 12, Personal: 14, Rest: 10 }
};

function loadUser() {
    const current = getStoredData("timeflowUser", null);
    if (current) return current;
    const legacy = getStoredData("user", null);
    if (legacy) {
        saveUser(legacy);
        return legacy;
    }
    return null;
}

function saveUser(user) {
    const normalized = {
        name: String(user?.name || "").trim(), role: String(user?.role || "").trim(),
        location: String(user?.location || "").trim(), priorities: Array.isArray(user?.priorities) ? user.priorities : [],
        wakeUp: user?.wakeUp || "", work: user?.work || "", gym: user?.gym || "", focus: user?.focus || "", sleep: user?.sleep || ""
    };
    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("timeflowUser", JSON.stringify(normalized));
}

function loadDashboardData() {
    return buildDashboardData();
}

function formatHours(hours) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
}

function setProgress(id, value) {
    const element = document.getElementById(id);
    if (element) element.style.width = `${Math.max(0, Math.min(100, value || 0))}%`;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function openFormModal(title, fields, submitLabel = "Save") {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="section-heading"><h2 id="modal-title">${escapeHtml(title)}</h2><button type="button" class="icon-button" data-modal-close aria-label="Close">×</button></div><form class="modal-form">${fields.map(field => `<label>${escapeHtml(field.label)}${field.type === "textarea" ? `<textarea name="${escapeHtml(field.name)}" ${field.required ? "required" : ""}>${escapeHtml(field.value)}</textarea>` : `<input name="${escapeHtml(field.name)}" type="${field.type || "text"}" value="${escapeHtml(field.value)}" ${field.required ? "required" : ""} min="${field.min ?? ""}" max="${field.max ?? ""}>`}</label>`).join("")}<div class="modal-actions"><button type="button" class="button-secondary" data-modal-close>Cancel</button><button class="button-primary">${escapeHtml(submitLabel)}</button></div></form></section>`;
        document.body.appendChild(overlay);
        const form = overlay.querySelector("form"); const close = value => { overlay.remove(); resolve(value); };
        overlay.querySelectorAll("[data-modal-close]").forEach(button => button.addEventListener("click", () => close(null)));
        overlay.addEventListener("click", event => { if (event.target === overlay) close(null); });
        overlay.addEventListener("keydown", event => { if (event.key === "Escape") close(null); });
        form.addEventListener("submit", event => { event.preventDefault(); close(Object.fromEntries(new FormData(form))); });
        form.querySelector("input, textarea")?.focus();
    });
}

function updateLegend(id, labels, values, colors, suffix) {
    const legend = document.getElementById(id);
    if (!legend) return;
    legend.innerHTML = labels.map((label, index) => `<span><i class="dot" style="background:${colors[index]}"></i>${label}<b>${Number(values[index]).toFixed(suffix === "%" && !Number.isInteger(values[index]) ? 1 : 0)}${suffix}</b></span>`).join("");
}

function createProductivityChart(data) {
    return new Chart(document.getElementById("productivity-chart"), {
        type: "line", data: { labels: data.labels, datasets: [{ label: "Productivity", data: data.values, borderColor: "#8066dc", backgroundColor: "rgba(128, 102, 220, .16)", fill: true, tension: .38, pointRadius: 4, pointHoverRadius: 7, pointBackgroundColor: "#fff", pointBorderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.parsed.y}%` } } }, scales: { y: { min: 0, max: 100, ticks: { callback: value => `${value}%`, color: "#a9a8ba" }, grid: { color: "#ededf3", borderDash: [3, 3] } }, x: { ticks: { color: "#a9a8ba" }, grid: { display: false } } } }
    });
}

function createFocusChart(data) {
    const highest = Math.max(...data.values);
    return new Chart(document.getElementById("focus-chart"), {
        type: "bar", data: { labels: data.labels, datasets: [{ label: "Focus hours", data: data.values, borderRadius: 6, backgroundColor: data.values.map(value => value === highest ? "#5d43ba" : "#a99ae9") }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.parsed.y} hours` } } }, scales: { y: { beginAtZero: true, suggestedMax: 4, ticks: { callback: value => `${value}h`, color: "#a9a8ba" }, grid: { color: "#ededf3", borderDash: [3, 3] } }, x: { ticks: { color: "#a9a8ba" }, grid: { display: false } } } }
    });
}

function createDoughnutChart(id, labels, values, colors) {
    return new Chart(document.getElementById(id), { type: "doughnut", data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 3, borderColor: "#fff", hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.label}: ${context.parsed}${id === "task-chart" ? "" : "%"}` } } } } });
}

function updateKPIs(periodData) {
    const tasks = periodData.tasks;
    const taskTotal = Object.values(tasks).reduce((total, value) => total + value, 0);
    const completedPercentage = taskTotal ? Math.round(tasks.completed / taskTotal * 100) : 0;
    const focusTotal = periodData.focus.reduce((total, value) => total + value, 0);
    const focusTarget = periodData.focus.length === 1 ? 2 : 20;
    const goalAverage = periodData.goals.length ? Math.round(periodData.goals.reduce((total, value) => total + value, 0) / periodData.goals.length) : 0;
    document.getElementById("productivity-value").firstChild.textContent = `${periodData.productivity[periodData.productivity.length - 1]}`;
    document.getElementById("tasks-value").firstChild.textContent = `${tasks.completed}`;
    document.getElementById("tasks-value").lastElementChild.textContent = `/${taskTotal}`;
    document.getElementById("tasks-detail").textContent = `${taskTotal - tasks.completed} tasks remaining · ${completedPercentage}% complete`;
    document.getElementById("focus-value").firstChild.textContent = formatHours(focusTotal);
    document.getElementById("focus-value").lastElementChild.textContent = "";
    document.getElementById("focus-detail").textContent = `${Math.round(focusTotal / focusTarget * 100)}% of weekly target`;
    document.getElementById("streak-value").firstChild.textContent = periodData.streak;
    document.getElementById("goals-value").firstChild.textContent = goalAverage;
    document.getElementById("goals-detail").textContent = `${periodData.goals.length} active goals`;
    document.getElementById("habits-value").firstChild.textContent = periodData.habits.completed;
    document.getElementById("habits-value").lastElementChild.textContent = `/${periodData.habits.total}`;
    document.getElementById("habits-detail").textContent = `${periodData.habits.total ? Math.round(periodData.habits.completed / periodData.habits.total * 100) : 0}% consistency`;
    document.getElementById("focus-percent").textContent = `${Math.min(100, Math.round(focusTotal / focusTarget * 100))}%`;
    document.getElementById("focus-total").textContent = formatHours(focusTotal);
    document.getElementById("focus-session-count")?.replaceChildren(String(loadFocusSessions().filter(session => session.completed).length));
    document.getElementById("focus-streak-count")?.replaceChildren(`${periodData.streak || 0} days`);
    document.getElementById("focus-ring").style.background = `conic-gradient(var(--purple) 0 ${Math.min(100, focusTotal / focusTarget * 100)}%, #eeedf5 ${Math.min(100, focusTotal / focusTarget * 100)}% 100%)`;
    document.getElementById("task-percent").textContent = `${completedPercentage}%`;
    const habitPercentage = periodData.habits.total ? periodData.habits.completed / periodData.habits.total * 100 : 0;
    ["tasks-progress", "goals-progress", "habits-progress", "focus-progress"].forEach(id => setProgress(id, id === "tasks-progress" ? completedPercentage : id === "goals-progress" ? goalAverage : id === "habits-progress" ? habitPercentage : focusTotal / focusTarget * 100));
    setProgress("daily-progress-bar", periodData.productivity[periodData.productivity.length - 1]);
    document.getElementById("daily-progress-value").textContent = `${periodData.productivity[periodData.productivity.length - 1]}%`;
    document.getElementById("featured-goal-value").textContent = `${periodData.goals[0] || 0}%`;
    document.getElementById("goal-reading-value").textContent = `${periodData.goals[1] || 0}%`;
    document.getElementById("goal-routine-value").textContent = `${periodData.goals[2] || 0}%`;
    const goals = loadGoals(); const featuredGoal = goals[0]; const secondGoal = goals[1]; const thirdGoal = goals[2]; document.getElementById("featured-goal-title")?.replaceChildren(featuredGoal?.title || "No active goal"); document.getElementById("featured-goal-description")?.replaceChildren(featuredGoal?.description || "Create a goal to start tracking progress."); document.getElementById("featured-goal-deadline")?.replaceChildren(featuredGoal?.deadline ? `Due ${featuredGoal.deadline}` : "No deadline"); document.getElementById("goal-reading-title")?.replaceChildren(secondGoal?.title || "No second goal"); document.getElementById("goal-routine-title")?.replaceChildren(thirdGoal?.title || "No third goal");
    setProgress("featured-goal-progress", periodData.goals[0]); setProgress("goal-reading-progress", periodData.goals[1]); setProgress("goal-routine-progress", periodData.goals[2]);
}

function updateDashboard() {
    if (!document.getElementById("productivity-chart") || typeof Chart === "undefined") return;
    const dashboardData = loadDashboardData();
    const period = document.getElementById("period-filter").value;
    const periodData = dashboardData.periods[period];
    const hasProductivity = periodData.productivity.some(value => value > 0); const hasFocus = periodData.focus.some(value => value > 0); const hasTasks = Object.values(periodData.tasks).some(value => value > 0); const hasDistribution = Object.values(dashboardData.timeDistribution).some(value => value > 0);
    [["productivity-chart", "productivity-empty", hasProductivity], ["focus-chart", "focus-empty", hasFocus], ["task-chart", "task-empty", hasTasks], ["time-distribution-chart", "distribution-empty", hasDistribution]].forEach(([canvasId, emptyId, hasData]) => { const canvas = document.getElementById(canvasId); const empty = document.getElementById(emptyId); if (canvas) canvas.style.visibility = hasData ? "visible" : "hidden"; if (empty) empty.classList.toggle("visible", !hasData); });
    const labels = period === "today" ? ["Today"] : period === "month" && periodData.productivity.length === 4 ? ["Week 1", "Week 2", "Week 3", "Week 4"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    [window.productivityChart, window.focusChart, window.timeDistributionChart, window.taskChart].forEach(chart => chart && chart.destroy());
    window.productivityChart = createProductivityChart({ labels, values: periodData.productivity });
    window.focusChart = createFocusChart({ labels, values: periodData.focus });
    const distributionLabels = Object.keys(dashboardData.timeDistribution); const distributionValues = Object.values(dashboardData.timeDistribution); const distributionColors = ["#8066dc", "#6a9ee9", "#5abb8d", "#e9aa5a", "#dfe0e8"];
    window.timeDistributionChart = createDoughnutChart("time-distribution-chart", distributionLabels, distributionValues, distributionColors);
    window.taskChart = createDoughnutChart("task-chart", ["Completed", "In progress", "Pending", "Overdue"], Object.values(periodData.tasks), ["#8066dc", "#6a9ee9", "#e9aa5a", "#e27a78"]);
    updateKPIs(periodData); updateLegend("time-legend", distributionLabels, distributionValues, distributionColors, "%"); updateLegend("task-legend", ["Completed", "In progress", "Pending", "Overdue"], Object.values(periodData.tasks), ["#8066dc", "#6a9ee9", "#e9aa5a", "#e27a78"], "");
    document.getElementById("tracked-total").textContent = `${Math.round(periodData.focus.reduce((sum, value) => sum + value, 0))}h`;
    document.getElementById("schedule-date").textContent = `Today · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
    const dashboardSchedule = document.getElementById("dashboard-schedule-list"); if (dashboardSchedule) { const todayItems = loadSchedule().filter(item => item.date === dateKey()).sort((a, b) => a.start.localeCompare(b.start)); dashboardSchedule.innerHTML = todayItems.length ? todayItems.slice(0, 5).map((item, index) => `<div class="schedule-item ${index === 0 ? "current" : ""}"><time>${escapeHtml(item.start)}</time><span class="schedule-line"></span><div class="schedule-icon purple-bg"><span aria-hidden="true">•</span></div><div class="schedule-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description || item.category)} <em>·</em> ${formatHours(durationMinutes(item.start, item.end) / 60)}</span></div><b class="schedule-status ${index === 0 ? "active-status" : ""}">${item.completed ? "Complete" : index === 0 ? "Next" : "Upcoming"}</b></div>`).join("") : `<div class="empty-state">No schedule blocks today.</div>`; }
}

function renderTasksPage() {
    const list = document.querySelector("[data-task-list]"); if (!list) return;
    const tasks = loadTasks(); const search = document.querySelector("[data-task-search]")?.value.trim().toLowerCase() || ""; const filter = document.querySelector("[data-task-filter]")?.value || "all"; const visibleTasks = tasks.filter(task => { const matchesSearch = !search || `${task.title} ${task.description} ${task.category}`.toLowerCase().includes(search); const matchesFilter = filter === "all" || (filter === "today" && task.dueDate === dateKey()) || (filter === "pending" && !task.completed) || (filter === "completed" && task.completed) || (filter === "overdue" && !task.completed && task.dueDate < dateKey()) || (filter === "priority" && task.priority === "high"); return matchesSearch && matchesFilter; }); list.innerHTML = visibleTasks.length ? visibleTasks.map(task => `<label class="task-row ${task.completed ? "done" : ""}"><input type="checkbox" data-task-id="${task.id}" ${task.completed ? "checked" : ""}><span>${escapeHtml(task.title)}</span><small class="task-time">${escapeHtml(task.time || "No time")} · ${escapeHtml(task.category || "General")}</small><button type="button" class="icon-button task-edit" data-edit-task="${task.id}" aria-label="Edit ${escapeHtml(task.title)}">Edit</button><button type="button" class="icon-button task-delete" data-delete-task="${task.id}" aria-label="Delete ${escapeHtml(task.title)}">×</button></label>`).join("") : `<div class="empty-state">${tasks.length ? "No tasks match this filter." : "You don't have any tasks yet."}</div>`;
    const completed = tasks.filter(task => task.status === "completed").length; const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    document.querySelectorAll("[data-task-progress]").forEach(element => { element.textContent = `${percentage}%${element.matches(".muted-link") ? " complete" : ""}`; }); setProgress("tasks-page-progress", percentage); setProgress("task-summary-progress", percentage);
    const taskCount = document.querySelector("[data-task-count]"); if (taskCount) taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`; const taskDate = document.querySelector("[data-task-date]"); if (taskDate) taskDate.textContent = `Today · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`; const priorityCount = tasks.filter(task => task.priority === "high" && !task.completed).length; const priorityCountElement = document.querySelector("[data-priority-count]"); if (priorityCountElement) priorityCountElement.textContent = `${priorityCount} priority task${priorityCount === 1 ? "" : "s"}`; const summaryDetail = document.querySelector("[data-task-summary-detail]"); if (summaryDetail) summaryDetail.textContent = `${completed} of ${tasks.length} tasks complete`;
    ["high", "medium", "low"].forEach(priority => { const count = tasks.filter(task => task.priority === priority).length; const value = document.querySelector(`[data-priority-value="${priority}"]`); const bar = document.querySelector(`[data-priority-bar="${priority}"]`); if (value) value.textContent = count; if (bar) bar.style.width = `${tasks.length ? count / tasks.length * 100 : 0}%`; });
    const summaryPercent = document.querySelector("[data-task-summary-percent]"); if (summaryPercent) summaryPercent.textContent = `${percentage}%`; const remaining = document.querySelector("[data-task-remaining]"); if (remaining) remaining.textContent = String(tasks.length - completed); const priority = document.querySelector("[data-task-priority]"); if (priority) priority.textContent = String(tasks.filter(task => task.priority === "high" && task.status !== "completed").length);
    const board = document.querySelector("[data-task-board]"); if (board) board.innerHTML = ["pending", "in-progress", "completed"].map(status => `<div><h3>${status === "in-progress" ? "In progress" : status === "pending" ? "To do" : "Completed"} <b>${tasks.filter(task => task.status === status).length}</b></h3>${tasks.filter(task => task.status === status).map(task => `<div class="board-task ${status === "completed" ? "completed-task" : ""}"><i class="priority ${task.priority || "low"}"></i><span>${escapeHtml(task.title)}<small>${escapeHtml(task.category || "General")} · ${escapeHtml(task.time || "No time")}</small></span><em>${escapeHtml(task.priority || "Done")}</em></div>`).join("")}</div>`).join("");
}

function setupTasksPage() {
    if (!document.querySelector("[data-task-list]")) return;
    renderTasksPage(); const addButton = document.querySelector("[data-add-task]");
    addButton?.addEventListener("click", async () => { const data = await openFormModal("Add task", [{ name: "title", label: "Title", required: true }, { name: "description", label: "Description", type: "textarea" }, { name: "category", label: "Category", value: "General" }, { name: "priority", label: "Priority", value: "medium" }, { name: "dueDate", label: "Due date", type: "date", value: dateKey() }, { name: "dueTime", label: "Due time", type: "time" }]); if (!data?.title?.trim()) return; const tasks = loadTasks(); tasks.push({ id: `task-${Date.now()}`, ...data, title: data.title.trim(), date: data.dueDate || dateKey(), time: data.dueTime || "", status: "pending", completed: false, createdAt: new Date().toISOString(), completedAt: null }); saveTasks(tasks); renderTasksPage(); });
    document.querySelector("[data-task-search]")?.addEventListener("input", renderTasksPage); document.querySelector("[data-task-filter]")?.addEventListener("change", renderTasksPage);
    document.addEventListener("change", event => { if (!event.target.matches("[data-task-id]")) return; const tasks = loadTasks(); const task = tasks.find(item => item.id === event.target.dataset.taskId); if (task) { task.completed = event.target.checked; task.status = event.target.checked ? "completed" : "pending"; task.completedAt = event.target.checked ? new Date().toISOString() : null; } saveTasks(tasks); renderTasksPage(); });
    document.addEventListener("click", async event => { const editButton = event.target.closest("[data-edit-task]"); if (editButton) { const tasks = loadTasks(); const task = tasks.find(item => item.id === editButton.dataset.editTask); if (task) { const data = await openFormModal("Edit task", [{ name: "title", label: "Title", value: task.title, required: true }, { name: "description", label: "Description", type: "textarea", value: task.description }, { name: "category", label: "Category", value: task.category }, { name: "priority", label: "Priority", value: task.priority }, { name: "dueDate", label: "Due date", type: "date", value: task.dueDate }, { name: "dueTime", label: "Due time", type: "time", value: task.dueTime }]); if (data?.title?.trim()) { Object.assign(task, data, { title: data.title.trim(), date: data.dueDate, time: data.dueTime }); saveTasks(tasks); renderTasksPage(); } } return; } const button = event.target.closest("[data-delete-task]"); if (!button) return; if (!window.confirm("Delete this task?")) return; saveTasks(loadTasks().filter(task => task.id !== button.dataset.deleteTask)); renderTasksPage(); });
}

function renderSchedulePage() {
    const timeline = document.querySelector("[data-schedule-list]"); if (!timeline) return; const items = loadSchedule().sort((a, b) => a.start.localeCompare(b.start)); timeline.innerHTML = items.length ? items.map(item => `<div class="timeline-row"><span class="timeline-time">${escapeHtml(item.start)}</span><i class="timeline-dot"></i><div class="timeline-event"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description || item.category)} · ${durationMinutes(item.start, item.end)} min</span></div><button type="button" class="icon-button" data-edit-schedule="${item.id}" aria-label="Edit ${escapeHtml(item.title)}">Edit</button><button type="button" class="icon-button schedule-delete" data-delete-schedule="${item.id}" aria-label="Delete ${escapeHtml(item.title)}">×</button></div>`).join("") : `<div class="empty-state">Add your first schedule block.</div>`;
    const total = items.reduce((sum, item) => sum + durationMinutes(item.start, item.end), 0); const completed = items.filter(item => item.completed).length; document.querySelectorAll("[data-schedule-total]").forEach(element => element.textContent = formatHours(total / 60)); document.querySelectorAll("[data-schedule-count]").forEach(element => element.textContent = `${items.length} blocks`); setProgress("schedule-page-progress", items.length ? completed / items.length * 100 : 0); const scheduleDate = document.querySelector("[data-schedule-date]"); if (scheduleDate) scheduleDate.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); const scheduleFocused = document.querySelector("[data-schedule-focused]"); if (scheduleFocused) scheduleFocused.textContent = formatHours(items.filter(item => item.completed).reduce((sum, item) => sum + durationMinutes(item.start, item.end), 0) / 60); const scheduleCompletion = document.querySelector("[data-schedule-completion]"); if (scheduleCompletion) scheduleCompletion.textContent = `${items.length ? Math.round(completed / items.length * 100) : 0}%`; const weekTotal = document.querySelector("[data-schedule-week-total]"); if (weekTotal) weekTotal.textContent = `${formatHours(total / 60)} scheduled`;
}

function setupSchedulePage() {
    if (!document.querySelector("[data-schedule-list]")) return; renderSchedulePage(); document.querySelector("[data-add-schedule]")?.addEventListener("click", async () => { const data = await openFormModal("Add schedule block", [{ name: "title", label: "Title", required: true }, { name: "description", label: "Description", type: "textarea" }, { name: "category", label: "Category", value: "Work" }, { name: "date", label: "Date", type: "date", value: dateKey() }, { name: "startTime", label: "Start time", type: "time", value: "09:00", required: true }, { name: "endTime", label: "End time", type: "time", value: "10:00", required: true }]); if (!data?.title?.trim() || durationMinutes(data.startTime, data.endTime) <= 0) return; const items = loadSchedule(); items.push({ id: `schedule-${Date.now()}`, ...data, title: data.title.trim(), start: data.startTime, end: data.endTime, createdAt: new Date().toISOString(), completed: false }); saveSchedule(items); renderSchedulePage(); }); document.addEventListener("click", async event => { const editButton = event.target.closest("[data-edit-schedule]"); if (editButton) { const items = loadSchedule(); const item = items.find(value => value.id === editButton.dataset.editSchedule); if (item) { const data = await openFormModal("Edit schedule block", [{ name: "title", label: "Title", value: item.title, required: true }, { name: "description", label: "Description", type: "textarea", value: item.description }, { name: "category", label: "Category", value: item.category }, { name: "date", label: "Date", type: "date", value: item.date }, { name: "startTime", label: "Start time", type: "time", value: item.startTime, required: true }, { name: "endTime", label: "End time", type: "time", value: item.endTime, required: true }]); if (data?.title?.trim() && durationMinutes(data.startTime, data.endTime) > 0) { Object.assign(item, data, { title: data.title.trim(), start: data.startTime, end: data.endTime }); saveSchedule(items); renderSchedulePage(); } } return; } const button = event.target.closest("[data-delete-schedule]"); if (!button) return; if (!window.confirm("Delete this schedule block?")) return; saveSchedule(loadSchedule().filter(item => item.id !== button.dataset.deleteSchedule)); renderSchedulePage(); });
}

function setupFocusPage() {
    const timer = document.querySelector("[data-timer]"); if (!timer) return; const storageKey = "timeflowTimerState"; let state; try { state = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (error) { state = {}; } state.duration = Number(state.duration) > 0 ? Number(state.duration) : 25 * 60; state.remaining = Number(state.remaining) >= 0 ? Number(state.remaining) : state.duration; state.running = Boolean(state.running && state.endTime); let interval = null;
    const remainingSeconds = () => state.running ? Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000)) : Math.max(0, state.remaining);
    const persist = () => { state.remaining = remainingSeconds(); localStorage.setItem(storageKey, JSON.stringify(state)); };
    const render = () => { const remaining = remainingSeconds(); const minutes = Math.floor(remaining / 60); const seconds = remaining % 60; document.querySelectorAll("[data-timer]").forEach(element => element.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`); document.querySelectorAll("[data-timer-start]").forEach(button => button.textContent = state.running ? "Pause focus" : remaining < state.duration ? "Resume focus" : "Start focus"); if (remaining <= 0 && state.running) complete(); else persist(); };
    const complete = () => { const elapsed = Math.round(state.duration / 60); saveFocusSessions([...loadFocusSessions(), { id: `focus-${Date.now()}`, date: dateKey(), startTime: new Date(state.startTime || Date.now() - state.duration * 1000).toISOString(), endTime: new Date().toISOString(), durationMinutes: elapsed, duration: elapsed, type: "Deep work", completed: true }]); state = { duration: state.duration, remaining: state.duration, running: false }; persist(); render(); };
    document.querySelectorAll("[data-timer-start]").forEach(button => button.addEventListener("click", () => { if (state.running) { state.remaining = remainingSeconds(); state.running = false; state.endTime = null; } else { state.startTime = Date.now(); state.endTime = Date.now() + state.remaining * 1000; state.running = true; } persist(); render(); })); document.querySelectorAll("[data-timer-reset]").forEach(button => button.addEventListener("click", () => { state = { duration: 25 * 60, remaining: 25 * 60, running: false }; persist(); render(); })); interval = setInterval(render, 1000); render();
}

function updateFocusPage() {
    if (!document.querySelector("[data-focus-total]")) return;
    const sessions = loadFocusSessions().filter(session => session.completed); const today = sessions.filter(session => session.date === dateKey()); const total = sessions.reduce((sum, session) => sum + session.duration, 0); const todayTotal = today.reduce((sum, session) => sum + session.duration, 0); const percentage = Math.min(100, Math.round(total / (20 * 60) * 100));
    document.querySelector("[data-focus-total]").textContent = formatHours(todayTotal / 60); document.querySelector("[data-focus-summary]").textContent = `${today.length} completed focus session${today.length === 1 ? "" : "s"} today.`; document.querySelector("[data-focus-sessions]").textContent = `${sessions.length} sessions this week`; document.querySelector("[data-focus-progress]").textContent = `${percentage}%`; document.querySelector("[data-focus-insight-total]")?.replaceChildren(formatHours(total / 60)); document.querySelector("[data-focus-insight-sessions]")?.replaceChildren(`${sessions.length} sessions`); document.querySelector("[data-focus-insight-average]")?.replaceChildren(`${sessions.length ? Math.round(total / sessions.length) : 0} minutes`); setProgress("focus-page-progress", percentage); setProgress("focus-page-today-progress", Math.min(100, todayTotal / 120 * 100));
}

function setupGoalsPage() {
    const container = document.querySelector("[data-goals-list]"); if (!container) return; const render = () => { const goals = loadGoals(); container.innerHTML = goals.length ? goals.map(goal => `<div class="goal-item"><strong>${escapeHtml(goal.title)}</strong><div class="progress"><span style="width:${goal.progress}%"></span></div><div class="goal-meta"><span>${goal.progress}% complete</span><span>Due ${goal.deadline || "No deadline"}</span></div><button class="button-secondary goal-update" data-goal-id="${goal.id}">Update</button><button class="button-secondary" data-delete-goal="${goal.id}">Delete</button></div>`).join("") : `<div class="empty-state">Create your first goal.</div>`; }; render(); document.querySelector("[data-add-goal]")?.addEventListener("click", async () => { const data = await openFormModal("Add goal", [{ name: "title", label: "Goal name", required: true }, { name: "description", label: "Description", type: "textarea" }, { name: "deadline", label: "Deadline", type: "date", value: dateKey() }]); if (!data?.title?.trim()) return; saveGoals([...loadGoals(), { id: `goal-${Date.now()}`, ...data, title: data.title.trim(), progress: 0, milestones: [], status: "active", createdAt: new Date().toISOString() }]); render(); }); document.addEventListener("click", async event => { const deleteButton = event.target.closest("[data-delete-goal]"); if (deleteButton) { if (window.confirm("Delete this goal?")) saveGoals(loadGoals().filter(goal => goal.id !== deleteButton.dataset.deleteGoal)); render(); return; } const button = event.target.closest("[data-goal-id]"); if (!button) return; const goals = loadGoals(); const goal = goals.find(item => item.id === button.dataset.goalId); if (!goal) return; const data = await openFormModal("Update goal", [{ name: "progress", label: "Progress (0-100)", type: "number", value: goal.progress, min: 0, max: 100 }]); if (data) { goal.progress = Math.max(0, Math.min(100, Number(data.progress) || 0)); goal.status = goal.progress === 100 ? "completed" : "active"; saveGoals(goals); render(); } });
}

function setupGoalMilestones() {
    const container = document.querySelector("[data-goals-list]"); if (!container) return;
    const renderMilestones = () => { const goals = loadGoals(); [...container.querySelectorAll(".goal-item")].forEach((card, index) => { const goal = goals[index]; if (!goal?.milestones?.length || card.querySelector(".goal-milestones")) return; const list = document.createElement("div"); list.className = "goal-milestones"; goal.milestones.forEach(milestone => { const label = document.createElement("label"); const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = Boolean(milestone.completed); checkbox.dataset.milestone = `${goal.id}:${milestone.id}`; label.append(checkbox, document.createTextNode(milestone.title)); list.append(label); }); card.append(list); }); };
    renderMilestones(); [...container.querySelectorAll(".goal-item")].forEach((card, index) => { const goal = loadGoals()[index]; if (!goal || card.querySelector("[data-add-milestone]")) return; const button = document.createElement("button"); button.className = "button-secondary"; button.textContent = "Milestone"; button.dataset.addMilestone = goal.id; card.append(button); });
    container.addEventListener("click", async event => { const button = event.target.closest("[data-add-milestone]"); if (!button) return; const goals = loadGoals(); const goal = goals.find(item => item.id === button.dataset.addMilestone); if (!goal) return; const data = await openFormModal("Add milestone", [{ name: "title", label: "Milestone", required: true }]); if (!data?.title?.trim()) return; goal.milestones = [...(goal.milestones || []), { id: `milestone-${Date.now()}`, title: data.title.trim(), completed: false }]; saveGoals(goals); renderMilestones(); });
    container.addEventListener("change", event => { if (!event.target.matches("[data-milestone]")) return; const [goalId, milestoneId] = event.target.dataset.milestone.split(":"); const goals = loadGoals(); const goal = goals.find(item => item.id === goalId); const milestone = goal?.milestones?.find(item => item.id === milestoneId); if (!milestone) return; milestone.completed = event.target.checked; goal.progress = goal.milestones.length ? Math.round(goal.milestones.filter(item => item.completed).length / goal.milestones.length * 100) : goal.progress; goal.status = goal.progress === 100 ? "completed" : "active"; saveGoals(goals); window.location.reload(); });
}

function setupHabitsPage() {
    const container = document.querySelector("[data-habits-list]"); if (!container) return; const render = () => { const habits = loadHabits(); const today = dateKey(); container.innerHTML = habits.length ? habits.map(habit => { const done = habit.completedDates.includes(today); return `<div class="habit-item"><strong>${escapeHtml(habit.name)}</strong><div class="progress"><span style="width:${Math.min(100, calculateStreak(habit) * 14)}%"></span></div><div class="goal-meta"><span>${calculateStreak(habit)} day streak</span><button class="button-secondary habit-toggle" data-habit-id="${habit.id}">${done ? "Undo today" : "Complete today"}</button><button class="button-secondary" data-delete-habit="${habit.id}">Delete</button></div></div>`; }).join("") : `<div class="empty-state">Start building a habit.</div>`; }; render(); document.querySelector("[data-add-habit]")?.addEventListener("click", async () => { const data = await openFormModal("Add habit", [{ name: "name", label: "Habit name", required: true }, { name: "description", label: "Description", type: "textarea" }, { name: "frequency", label: "Frequency", value: "Daily" }]); if (!data?.name?.trim()) return; saveHabits([...loadHabits(), { id: `habit-${Date.now()}`, ...data, name: data.name.trim(), title: data.name.trim(), completedDates: [], createdAt: new Date().toISOString() }]); render(); }); document.addEventListener("click", event => { const deleteButton = event.target.closest("[data-delete-habit]"); if (deleteButton) { if (window.confirm("Delete this habit?")) saveHabits(loadHabits().filter(habit => habit.id !== deleteButton.dataset.deleteHabit)); render(); return; } const button = event.target.closest("[data-habit-id]"); if (!button) return; const habits = loadHabits(); const habit = habits.find(item => item.id === button.dataset.habitId); if (!habit) return; const today = dateKey(); habit.completedDates = habit.completedDates.includes(today) ? habit.completedDates.filter(value => value !== today) : [...habit.completedDates, today]; saveHabits(habits); render(); });
}


function setupAnalyticsPage() {
    if (!document.getElementById("analytics-focus-chart") || typeof Chart === "undefined") return;
    const data = buildDashboardData().periods.week; const labels = getDayLabels(); const charts = [window.analyticsFocusChart, window.analyticsProductivityChart]; charts.forEach(chart => chart?.destroy());
    window.analyticsFocusChart = new Chart(document.getElementById("analytics-focus-chart"), { type: "bar", data: { labels, datasets: [{ label: "Focus hours", data: data.focus, backgroundColor: "#a99ae9", borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.parsed.y.toFixed(1)} hours` } } }, scales: { y: { beginAtZero: true, ticks: { color: "#a9a8ba" }, grid: { color: "#ededf3" } }, x: { ticks: { color: "#a9a8ba" }, grid: { display: false } } } } });
    window.analyticsProductivityChart = new Chart(document.getElementById("analytics-productivity-chart"), { type: "line", data: { labels, datasets: [{ label: "Productivity", data: data.productivity, borderColor: "#8066dc", backgroundColor: "rgba(128,102,220,.14)", fill: true, tension: .38, pointRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.parsed.y}%` } } }, scales: { y: { min: 0, max: 100, ticks: { color: "#a9a8ba" }, grid: { color: "#ededf3" } }, x: { ticks: { color: "#a9a8ba" }, grid: { display: false } } } } });
    const totalFocus = loadFocusSessions().filter(session => session.completed).reduce((sum, session) => sum + session.duration, 0); const tasks = loadTasks(); const completed = tasks.filter(task => task.status === "completed").length; const completion = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    const statValues = document.querySelectorAll(".stats-grid .stat-value"); if (statValues[0]) statValues[0].textContent = formatHours(totalFocus / 60); if (statValues[1]) statValues[1].textContent = `${completion}%`; if (statValues[2]) statValues[2].textContent = String(loadFocusSessions().filter(session => session.completed).length); const focusTotal = document.querySelector("[data-analytics-focus-total]"); if (focusTotal) focusTotal.textContent = `${formatHours(totalFocus / 60)} total`; const focusStat = document.querySelector("[data-analytics-focus]"); if (focusStat) focusStat.textContent = formatHours(totalFocus / 60); const completionStat = document.querySelector("[data-analytics-completion]"); if (completionStat) completionStat.textContent = `${completion}%`; const sessionStat = document.querySelector("[data-analytics-sessions]"); if (sessionStat) sessionStat.textContent = String(loadFocusSessions().filter(session => session.completed).length);
    const habits = loadHabits(); const schedule = loadSchedule(); const habitConsistency = habits.length ? Math.round(habits.filter(habit => habit.completedDates.includes(dateKey())).length / habits.length * 100) : 0; const scheduleCompletion = schedule.length ? Math.round(schedule.filter(item => item.completed).length / schedule.length * 100) : 0; const focusConsistency = Math.min(100, Math.round(totalFocus / 1200 * 100)); const productivityScore = Math.min(10, Math.round(((completion * .3) + (focusConsistency * .3) + (scheduleCompletion * .2) + (habitConsistency * .1) + ((goalsAverage() || 0) * .1)) / 10 * 10) / 10);
    document.querySelector("[data-productivity-score]")?.replaceChildren(productivityScore.toFixed(1)); document.querySelector("[data-productivity-message]")?.replaceChildren(productivityScore ? "Your score is calculated from tasks, focus, schedule, habits, and goals." : "Use TimeFlow for a few days to unlock meaningful analytics."); document.querySelector("[data-analytics-consistency]")?.replaceChildren(`${habitConsistency}%`); document.querySelector("[data-analytics-score-sessions]")?.replaceChildren(String(loadFocusSessions().filter(session => session.completed).length)); document.querySelector("[data-analytics-best-streak]")?.replaceChildren(`${Math.max(0, ...habits.map(calculateStreak))}d`); document.querySelector("[data-efficiency-score]")?.replaceChildren(`${focusConsistency}%`); document.querySelector("[data-efficiency=\"deep\"]")?.replaceChildren(`${Math.round(totalFocus ? totalFocus / (totalFocus + 60) * 100 : 0)}%`); document.querySelector("[data-efficiency=\"study\"]")?.replaceChildren(`${Math.round(loadFocusSessions().filter(session => session.type === "Study").reduce((sum, session) => sum + session.duration, 0) / Math.max(totalFocus, 1) * 100)}%`); document.querySelector("[data-efficiency=\"planning\"]")?.replaceChildren(`${completion}%`); document.querySelector("[data-efficiency=\"admin\"]")?.replaceChildren(`${scheduleCompletion}%`);
}

function goalsAverage() { const goals = loadGoals(); return goals.length ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length : 0; }

function updatePageSummaries() {
    const goals = loadGoals();
    document.querySelector("[data-active-goals]")?.replaceChildren(`${goals.filter(goal => goal.status !== "completed").length} active`);
    document.querySelector("[data-featured-goal-score]")?.replaceChildren(`${goals[0]?.progress || 0}%`);
    const habits = loadHabits(); const today = dateKey(); const streak = Math.max(0, ...habits.map(calculateStreak));
    const consistency = habits.length ? Math.round(habits.filter(habit => habit.completedDates.includes(today)).length / habits.length * 100) : 0;
    document.querySelector("[data-habit-streak]")?.replaceChildren(`${streak} day streak`);
    document.querySelector("[data-habit-consistency]")?.replaceChildren(`${consistency}% this week`);
    document.querySelector("[data-habit-rate]")?.replaceChildren(`${consistency}%`);
    document.querySelector("[data-habit-count]")?.replaceChildren(String(habits.length));
}
const STORAGE_KEYS = {
    tasks: "timeflowTasks",
    schedule: "timeflowSchedule",
    focus: "timeflowFocus",
    goals: "timeflowGoals",
    habits: "timeflowHabits",
    settings: "timeflowSettings"
};

function getStoredData(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(fallback) ? (Array.isArray(value) ? value : fallback) : (value && typeof value === "object" ? value : fallback);
    } catch (error) { return fallback; }
}

function saveStoredData(key, value) { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("timeflow-data-change")); }

function dateKey(date = new Date()) { return date.toISOString().slice(0, 10); }

function seedStoredData() {
    const today = dateKey();
    if (!localStorage.getItem(STORAGE_KEYS.tasks)) saveStoredData(STORAGE_KEYS.tasks, [
        { id: "task-1", title: "Review weekly priorities", category: "Planning", priority: "high", date: today, time: "09:00", status: "completed" },
        { id: "task-2", title: "Finish project proposal", category: "Work", priority: "high", date: today, time: "11:30", status: "pending" },
        { id: "task-3", title: "30 minute workout", category: "Health", priority: "medium", date: today, time: "17:00", status: "pending" },
        { id: "task-4", title: "Plan tomorrow", category: "Personal", priority: "low", date: today, time: "20:30", status: "pending" }
    ]);
    if (!localStorage.getItem(STORAGE_KEYS.schedule)) saveStoredData(STORAGE_KEYS.schedule, [
        { id: "schedule-1", title: "Morning routine", category: "Personal", date: today, start: "07:00", end: "08:00", description: "Start the day slowly", completed: true },
        { id: "schedule-2", title: "Deep work", category: "Work", date: today, start: "10:00", end: "11:30", description: "Project proposal", completed: false },
        { id: "schedule-3", title: "Lunch break", category: "Personal", date: today, start: "12:30", end: "13:15", description: "Rest and reset", completed: false },
        { id: "schedule-4", title: "Movement", category: "Exercise", date: today, start: "17:00", end: "17:45", description: "Gym session", completed: false },
        { id: "schedule-5", title: "Evening reset", category: "Personal", date: today, start: "20:30", end: "21:00", description: "Plan tomorrow", completed: false }
    ]);
    if (!localStorage.getItem(STORAGE_KEYS.focus)) saveStoredData(STORAGE_KEYS.focus, [
        { id: "focus-1", date: today, duration: 55, type: "Deep work", completed: true },
        { id: "focus-2", date: today, duration: 45, type: "Study", completed: true },
        { id: "focus-3", date: today, duration: 30, type: "Deep work", completed: true }
    ]);
    if (!localStorage.getItem(STORAGE_KEYS.goals)) saveStoredData(STORAGE_KEYS.goals, [
        { id: "goal-1", title: "Ship portfolio project", progress: 68, deadline: "2026-10-12", description: "Make meaningful progress every week." },
        { id: "goal-2", title: "Read 12 books", progress: 42, deadline: "2026-12-31", description: "Read consistently." },
        { id: "goal-3", title: "Build a consistent routine", progress: 76, deadline: "2026-09-30", description: "Keep the daily rhythm." }
    ]);
    if (!localStorage.getItem(STORAGE_KEYS.habits)) saveStoredData(STORAGE_KEYS.habits, [
        { id: "habit-1", title: "Morning movement", completedDates: [today] },
        { id: "habit-2", title: "Read 20 minutes", completedDates: [today] },
        { id: "habit-3", title: "Plan tomorrow", completedDates: [] }
    ]);
}

function loadTasks() { return getStoredData(STORAGE_KEYS.tasks, []).map(task => ({ id: task.id || `task-${Date.now()}-${Math.random()}`, title: String(task.title || "Untitled task"), description: task.description || "", category: task.category || "General", priority: task.priority || "medium", dueDate: task.dueDate || task.date || dateKey(), dueTime: task.dueTime || task.time || "", date: task.date || task.dueDate || dateKey(), time: task.time || task.dueTime || "", completed: task.completed ?? task.status === "completed", status: task.status || (task.completed ? "completed" : "pending"), createdAt: task.createdAt || new Date().toISOString(), completedAt: task.completedAt || null })); }
function saveTasks(tasks) { saveStoredData(STORAGE_KEYS.tasks, tasks); }
function loadSchedule() { return getStoredData(STORAGE_KEYS.schedule, []).map(item => ({ ...item, id: item.id || `schedule-${Date.now()}-${Math.random()}`, title: item.title || "Untitled block", description: item.description || "", category: item.category || "Personal", date: item.date || dateKey(), startTime: item.startTime || item.start || "09:00", endTime: item.endTime || item.end || "10:00", start: item.start || item.startTime || "09:00", end: item.end || item.endTime || "10:00", completed: Boolean(item.completed) })); }
function saveSchedule(schedule) { saveStoredData(STORAGE_KEYS.schedule, schedule); }
function loadFocusSessions() { return getStoredData(STORAGE_KEYS.focus, []).map(session => ({ ...session, id: session.id || `focus-${Date.now()}-${Math.random()}`, date: session.date || dateKey(), duration: Number(session.durationMinutes ?? session.duration) || 0, durationMinutes: Number(session.durationMinutes ?? session.duration) || 0, completed: session.completed !== false, type: session.type || "Deep work" })); }
function saveFocusSessions(sessions) { saveStoredData(STORAGE_KEYS.focus, sessions); }
function loadGoals() { return getStoredData(STORAGE_KEYS.goals, []).map(goal => ({ ...goal, id: goal.id || `goal-${Date.now()}-${Math.random()}`, title: goal.title || "Untitled goal", progress: Math.max(0, Math.min(100, Number(goal.progress) || 0)), milestones: Array.isArray(goal.milestones) ? goal.milestones : [], status: goal.status || "active" })); }
function saveGoals(goals) { saveStoredData(STORAGE_KEYS.goals, goals); }
function loadHabits() { return getStoredData(STORAGE_KEYS.habits, []).map(habit => ({ ...habit, id: habit.id || `habit-${Date.now()}-${Math.random()}`, name: habit.name || habit.title || "Untitled habit", title: habit.title || habit.name || "Untitled habit", completedDates: Array.isArray(habit.completedDates) ? habit.completedDates : [] })); }
function saveHabits(habits) { saveStoredData(STORAGE_KEYS.habits, habits); }

function getDayLabels() { return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; }

function buildDashboardData() {
    const tasks = loadTasks(); const sessions = loadFocusSessions(); const goals = loadGoals(); const habits = loadHabits(); const schedule = loadSchedule();
    const labels = getDayLabels(); const now = new Date(); const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const productivity = labels.map((label, index) => { const day = new Date(monday); day.setDate(monday.getDate() + index); const key = dateKey(day); const dayTasks = tasks.filter(task => task.date === key); const completed = dayTasks.filter(task => task.status === "completed").length; const dayFocus = sessions.filter(session => session.date === key && session.completed).reduce((sum, session) => sum + session.duration, 0); const daySchedule = schedule.filter(item => item.date === key); const dayHabits = habits.filter(habit => habit.completedDates.includes(key)).length; return dayTasks.length || dayFocus || daySchedule.length || dayHabits ? Math.min(100, Math.round((completed / Math.max(dayTasks.length, 1) * 40) + Math.min(dayFocus / 120, 1) * 35 + Math.min(dayHabits / Math.max(habits.length, 1), 1) * 25)) : 0; });
    const focus = labels.map((label, index) => { const day = new Date(monday); day.setDate(monday.getDate() + index); return sessions.filter(session => session.date === dateKey(day) && session.completed).reduce((sum, session) => sum + session.duration, 0) / 60; });
    const taskValues = { completed: tasks.filter(task => task.status === "completed").length, inProgress: tasks.filter(task => task.status === "in-progress").length, pending: tasks.filter(task => task.status === "pending").length, overdue: tasks.filter(task => task.status !== "completed" && task.date && task.date < dateKey()).length };
    const focusMinutes = sessions.filter(session => session.completed).reduce((sum, session) => sum + session.duration, 0); const exercise = schedule.filter(item => item.category === "Exercise").reduce((sum, item) => sum + durationMinutes(item.start, item.end), 0); const work = schedule.filter(item => item.category === "Work").reduce((sum, item) => sum + durationMinutes(item.start, item.end), 0); const study = sessions.filter(session => session.type === "Study").reduce((sum, session) => sum + session.duration, 0); const tracked = work + study + exercise; const timeDistribution = { Work: work, Study: study, Exercise: exercise, Personal: Math.max(0, tracked * .33), Rest: Math.max(0, tracked * .24) }; const habitCompleted = habits.filter(habit => habit.completedDates.includes(dateKey())).length;
    const base = { productivity, focus, tasks: taskValues, goals: goals.map(goal => Number(goal.progress) || 0), habits: { completed: habitCompleted, total: habits.length }, streak: Math.max(0, ...habits.map(calculateStreak)), timeDistribution };
    return { periods: { week: base, today: { ...base, productivity: [productivity[6] || 0], focus: [focus[6] || 0] }, lastWeek: base, month: base }, timeDistribution };
}

function durationMinutes(start, end) { if (!start || !end) return 0; const [startHour, startMinute] = start.split(":").map(Number); const [endHour, endMinute] = end.split(":").map(Number); return Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute); }

function calculateStreak(habit) { let streak = 0; const date = new Date(); while (habit.completedDates.includes(dateKey(date))) { streak++; date.setDate(date.getDate() - 1); } return streak; }

seedStoredData(); setupTasksPage(); setupSchedulePage(); setupFocusPage(); updateFocusPage(); setupGoalsPage(); setupGoalMilestones(); setupHabitsPage(); updatePageSummaries();
setupAnalyticsPage();
window.addEventListener("storage", () => { if (document.getElementById("period-filter")) updateDashboard(); renderTasksPage(); renderSchedulePage(); updateFocusPage(); updatePageSummaries(); setupAnalyticsPage(); });
window.addEventListener("timeflow-data-change", () => { if (document.getElementById("period-filter")) updateDashboard(); updateFocusPage(); updatePageSummaries(); setupAnalyticsPage(); });

if (document.getElementById("period-filter")) {
    document.getElementById("period-filter").addEventListener("change", updateDashboard);
    updateDashboard();
}