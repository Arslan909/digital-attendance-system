document.getElementById("Add/Edit Attendance").addEventListener("click", function () {

    const classDisplay = document.getElementById("class-name-display")
    const class_name = classDisplay.innerHTML 

    window.location.href = `attendance?class=${class_name}`;
});
document.getElementById("generate-report").addEventListener("click", function () {

    const classDisplay = document.getElementById("class-name-display")
    const class_name = classDisplay.innerHTML 

    window.location.href = `month_report_page?class=${class_name}`;
});