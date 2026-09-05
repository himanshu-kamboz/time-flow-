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

function saveInformation (){

    let priorityCard = document.querySelectorAll(".priority-card");

    let priorities = [];

    priorityCard.forEach(function (card) {
        if (card.classList.contains("selected")){
            priorities.push(card.textContent.trim())
        }
    });

    const user = {
        name : document.getElementById("name").value.trim(),
        role : document.getElementById("role").value.trim(),
        location : document.getElementById("location").value.trim(),

        priorities : priorities,

        wakeUp : document.getElementById("wake-up").value.trim(),
        work : document.getElementById("work").value.trim(),
        gym : document.getElementById("gym").value.trim(),
        focus : document.getElementById("focus").value.trim(),
        sleep : document.getElementById("sleep").value.trim(),
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

const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
document.querySelectorAll('[data-user-name]').forEach((element) => { element.textContent = storedUser.name || 'there'; });
document.querySelectorAll('[data-user-initials]').forEach((element) => { element.textContent = (storedUser.name || 'TF').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); });
document.querySelectorAll('.task-row input').forEach((checkbox) => { checkbox.addEventListener('change', () => checkbox.closest('.task-row').classList.toggle('done', checkbox.checked)); });
let timerInterval;
let timerSeconds = 25 * 60;
const timerDisplay = document.querySelector('[data-timer]');
function renderTimer() { if (timerDisplay) timerDisplay.textContent = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`; }
document.querySelector('[data-timer-start]')?.addEventListener('click', (event) => { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; event.currentTarget.textContent = 'Start focus'; return; } event.currentTarget.textContent = 'Pause'; timerInterval = setInterval(() => { timerSeconds = Math.max(0, timerSeconds - 1); renderTimer(); if (!timerSeconds) clearInterval(timerInterval); }, 1000); });
document.querySelector('[data-timer-reset]')?.addEventListener('click', () => { clearInterval(timerInterval); timerInterval = null; timerSeconds = 25 * 60; renderTimer(); });
renderTimer();
