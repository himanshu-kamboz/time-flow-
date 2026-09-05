let stepsCount = 1;

let next = document.querySelectorAll(".next-btn");
let back = document.querySelectorAll(".back-btn");

next.forEach(function (btn) {

    btn.addEventListener("click", function () {
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
        if (card.classList.contains("selected")) {
            priorities.push(card.textContent.trim())
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

    localStorage.setItem("user", JSON.stringify(user));

}

let dashboardBtn = document.getElementById("dashboard-btn");

if (dashboardBtn) {
    dashboardBtn.addEventListener("click", function (event) {
        event.preventDefault();
        saveInformation();
        window.location.href = "./pages/dashboard.html";
    });
}

function updateTimeDate() {
    const now = new Date();

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

    document.getElementById("current-date").textContent = date;
    document.getElementById("current-time").textContent = time;
}

updateTimeDate();

setInterval(updateTimeDate,1000);