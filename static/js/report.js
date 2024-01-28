



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

        genrateReoprtTable(className)
        document.getElementById("monthly-reportBtn").addEventListener("click", genrateReoprtTable(className))

        document.getElementById("percentage-reportBtn").addEventListener("click", function () {
            window.location.href = `/percentage_report_page`;
        })


        document.getElementById("Add/Edit Attendance").addEventListener("click", function () {

            console.log(className)

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


function genrateReoprtTable(className) {

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
            document.getElementById("report-table").innerHTML = "";

            let table = document.createElement('table');

        
            let headerRow = document.createElement('tr');
            let emptyHeaderCell = document.createElement('th');
            emptyHeaderCell.textContent = "Student"
            headerRow.appendChild(emptyHeaderCell);

            datesArray.forEach(date => {
                let headerCell = document.createElement('th');
                headerCell.textContent = date;
                headerRow.appendChild(headerCell);
            });

            table.appendChild(headerRow);

            // rows with student names and attendance status
            studentsArray.forEach(student => {
                let row = document.createElement('tr');


                let nameCell = document.createElement('td');
                nameCell.textContent = student;
                row.appendChild(nameCell);


                datesArray.forEach(date => {
                    let statusCell = document.createElement('td');
                    let attendanceStatus = getAttendanceStatus(data, date, student);
                    statusCell.textContent = attendanceStatus || '-';
                    row.appendChild(statusCell);
                });

                table.appendChild(row);
            });
            // document.body.appendChild(table);
            document.getElementById("report-table").appendChild(table);

            // function to check if student was present on specific lecture day
            function getAttendanceStatus(data, date, student) {
                let result = null;

                data.forEach(entry => {
                    const [entryDate, ...studentInfos] = entry[0];

                    if (entryDate === date) {
                        studentInfos.forEach(studentInfo => {
                            if (studentInfo.name === student) {
                                result = studentInfo.status;
                            }
                        });
                    }
                });
                return result;
            }

        })
}