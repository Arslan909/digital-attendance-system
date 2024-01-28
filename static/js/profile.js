const urlParams = new URLSearchParams(window.location.search);
let className = urlParams.get("class_name");
let student = urlParams.get("student_name");
let rollNumber = urlParams.get("rollnumber");

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

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("appli-submit").innerText = "apply for leave"

    fetch("/report_data", {
        method: "POST",
        body: JSON.stringify({ className: className }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {

            const attendancePercentages = {};

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
                attendancePercentages[student] = attendancePercentage.toFixed(1);
            } else {
                attendancePercentages[student] = 'N/A';
            }

            document.getElementById("percentage").innerHTML = `${Object.values(attendancePercentages)}%`
            document.getElementById("name").innerHTML = `${Object.keys(attendancePercentages)}`
            document.getElementById("rollnumber").innerHTML = rollNumber
            document.getElementById("class").innerHTML = className
            console.log(attendancePercentages)





            // notification logic
            fetch("/GetNotifyData", {
                method: "POST",
                body: JSON.stringify({ name: student }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json()).then(data => {
                console.log(data)
                if (data.message === "show notification") {
                    document.getElementById("noti-div").innerHTML = "";

                    let notification = document.createElement("div");
                    notification.classList.add("notification");

                    let msg = document.createElement("h3");
                    msg.innerText = "Application Approved";

                    let closeNotiButton = document.createElement("button");
                    closeNotiButton.innerText = "X";

                    closeNotiButton.addEventListener("click", function () {
                        document.getElementById("noti-div").innerHTML = "";
                    });

                    notification.appendChild(msg);
                    notification.appendChild(closeNotiButton);

                    document.getElementById("noti-div").appendChild(notification);
                } 
                else {
                    document.getElementById("noti-div").innerHTML = "";
                }
            })



        })
})

const uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    formData.append("studentName", student)
    formData.append("studentClass", className)

    const dateFromInput = document.querySelector('input[name="date_from"]');
    const dateToInput = document.querySelector('input[name="date_to"]');

    formData.append("date_from", dateFromInput.value);
    formData.append("date_to", dateToInput.value);

    fetch("/submit_application", {
        method: "POST",
        body: formData,
    })
        .then(response => response.text())
        .then(message => {
            console.log(message);
            document.getElementById("appli-submit").innerText = "request applied"
        })
        .catch(error => {
            console.error('Error:', error);
        });

});