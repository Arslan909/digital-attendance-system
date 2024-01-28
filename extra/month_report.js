const urlParams = new URLSearchParams(window.location.search);
let className = urlParams.get("class");

document.addEventListener("DOMContentLoaded", function () {



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
            // console.log(data);

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

            // Create the table
            let table = document.createElement('table');

            // header row 
            let headerRow = document.createElement('tr');
            let emptyHeaderCell = document.createElement('th');
            headerRow.appendChild(emptyHeaderCell); // Empty cell in the top-left corner

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
            document.body.appendChild(table);

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
            

            const attendancePercentages = calculateAttendancePercentage(data, studentsArray);
            console.log("Attendance Percentages:");
            console.log(attendancePercentages);
            

        })
})


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