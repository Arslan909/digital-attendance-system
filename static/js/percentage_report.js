// const urlParams = new URLSearchParams(window.location.search);
// let className = urlParams.get("class_name");




document.addEventListener("DOMContentLoaded", function () {
    let className

    fetch("/className", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(data => {
        // console.log(typeof(data))
        className = data

        let class_name_display = document.getElementById("class-name-display")
        class_name_display.innerText = className;

        genratePresentPercentage(className)
        document.getElementById("percentage-reportBtn").addEventListener("click", genratePresentPercentage(className))

        document.getElementById("monthly-reportBtn").addEventListener("click", function () {
            window.location.href = `month_report_page`;
        })


        document.getElementById("Add/Edit Attendance").addEventListener("click", function () {

            // console.log(className)

            window.location.href = `/attendanceExtra`;
        });
        // document.getElementById("register-student").addEventListener("click", function () {
        //     window.location.href = `/form_page`;
        // });
        document.getElementById("logout").addEventListener("click", function () {
            fetch("/logout", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    window.location.href = response.url;
                }
            })
        });

    })

})

function genratePresentPercentage(className) {

    fetch("/report_data", {
        method: "POST",
        body: JSON.stringify({ className: className }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // data.sort((a, b) => new Date(a[0][0]) - new Date(b[0][0]));
            console.log(data);

            let datesArray = [];
            let studentsSet = new Set();

            data.forEach(entry => {
                let date = entry[0][0];
                datesArray.push(date);

                entry[0].slice(1).forEach(studentInfo => {
                    let studentName = studentInfo.name;
                    studentsSet.add(studentName);
                });
            });

            datesArray.sort();
            let studentsArray = Array.from(studentsSet);

            const attendancePercentages = calculateAttendancePercentage(data, studentsArray);
            console.log("Attendance Percentages:");
            console.log(attendancePercentages)
            updateAttendanceDashboard(attendancePercentages);


            function calculateAttendancePercentage(data, studentsArray) {
                const attendancePercentages = {};

                studentsArray.forEach(student => {
                    let totalClasses = 0;
                    let presentClasses = 0;

                    data.forEach(entry => {
                        const [, ...studentInfos] = entry[0];

                        studentInfos.forEach(studentInfo => {
                            if (studentInfo.name === student) {
                                totalClasses++;
                                if (studentInfo.status === 'present') {
                                    presentClasses++;
                                }
                            }
                        });
                    });

                    if (totalClasses > 0) {
                        const attendancePercentage = (presentClasses / totalClasses) * 100;
                        attendancePercentages[student] = attendancePercentage.toFixed(2);
                    } else {
                        attendancePercentages[student] = 'N/A';
                    }
                });

                return attendancePercentages;
            }


        })
}

function updateAttendanceDashboard(attendancePercentages) {
    const dashboardElement = document.getElementById("attendance-persentage-table");


    dashboardElement.innerHTML = "";

    const tableElement = document.createElement("table");
    // tableElement.classList.add("attendance-table");

    const headerRow = tableElement.insertRow(0);
    const studentHeader = headerRow.insertCell(0);
    const percentageHeader = headerRow.insertCell(1);
    headerRow.className = "table-header"

    studentHeader.textContent = "Student";
    percentageHeader.textContent = "Attendance Percentage";


    Object.entries(attendancePercentages).forEach(([student, percentage]) => {
        const row = tableElement.insertRow(-1);

        const studentCell = row.insertCell(0);
        const percentageCell = row.insertCell(1);

        studentCell.textContent = student;
        percentageCell.textContent = `${percentage}%`;
    });

    dashboardElement.appendChild(tableElement);
}
