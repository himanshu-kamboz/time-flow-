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

