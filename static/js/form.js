let className

fetch("/className", {
    method: "GET",
    headers: {
        'Content-Type': 'application/json'
    }
}).then(response => response.json()).then(data => {
    // console.log(typeof(data))
    className = data
    // console.log(className)

    // let class_name_display = document.getElementById("class-name-display")
    // class_name_display.innerText = className;
    document.getElementById("submitBtn").innerText = "Submit"
    document.getElementById("upload-csvBtn").innerText = "Submit"

    document.getElementById("myForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        console.log(formData)

        fetch("/submit", {
            method: "POST",
            body: formData,
        })
            .then(response => {
                if (response.ok) {
                    document.getElementById("submitBtn").innerText = "Submitted"
                    console.log('New student data saved successfully');
                } else {
                    console.error('New student data Failed successfully');
                }
                this.reset()
            })
    });

    document.getElementById('upload-csvBtn').addEventListener('click', function uploadCSV() {
        let fileInput = document.getElementById('csvFile');
        let file = fileInput.files[0];

        if (!file) {
            console.error('No file selected');
            return;
        }

        let reader = new FileReader();
        reader.onload = function (event) {
            let csvData = event.target.result;

            let jsonData = csvToJson(csvData);

            fetch('/upload_csv_json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            })
                .then(response => {
                    if (response.ok) {
                        document.getElementById("upload-csvBtn").innerText = "Submitted"
                        return response.json();
                    } else {
                        throw new Error('Failed to upload JSON data');
                    }
                })
        };

        reader.readAsText(file);
    });

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


    // Function to convert CSV to JSON
    function csvToJson(csvData) {
        let lines = csvData.split('\n');
        let result = [];
        let headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            let obj = {};
            let currentLine = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j];
            }

            result.push(obj);
        }

        return result;
    }

    document.getElementById("application-request").addEventListener('click', function () {
        requestApprovalTable(className)
    })

})


function requestApprovalTable(className) {
    fetch("/applicantData", {
        method: "POST",
        body: JSON.stringify({ className: className }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(respsone => respsone.json())
        .then(data => {
            console.log(data)

            if (data.length > 0) {
                const tableElement = document.createElement("table");


                const headerRow = tableElement.insertRow(0);

                const studentName = headerRow.insertCell(0);
                const studentClass = headerRow.insertCell(1);
                const applicationName = headerRow.insertCell(2);
                const date_from = headerRow.insertCell(3);
                const date_to = headerRow.insertCell(4);
                headerRow.className = "header-row"

                studentName.textContent = "Name"
                studentClass.textContent = "Class"
                applicationName.textContent = "application"
                date_from.textContent = "date from"
                date_to.textContent = "date to"




                data.forEach((item) => {
                    const row = tableElement.insertRow(-1)

                    const nameCell = row.insertCell(0);
                    const classCell = row.insertCell(1);
                    const applicationCell = row.insertCell(2)
                    const DateFromCell = row.insertCell(3)
                    const dateToCell = row.insertCell(4)

                    let buttonCell = row.insertCell(5);
                    let buttonCell2 = row.insertCell(6);
                    let button = document.createElement('button');
                    button.innerHTML = 'approve';
                    button.className = 'approveBtn'
                    button.id = 'approveBtn'

                    let button2 = document.createElement('button');
                    button2.innerHTML = 'cancel';
                    button2.className = 'approveBtn'
                    button2.id = 'approveBtn'

                    button.setAttribute('studentName', item.name);
                    button2.setAttribute('studentName', item.name);

                    // functinality for approve button in table 
                    button.addEventListener("click", function () {
                        const studentName = this.getAttribute('studentName');

                        fetch("/approveApplication", {
                            method: "POST",
                            body: JSON.stringify({ className: className, studentName: studentName }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(respsone => respsone.json())
                            .then(data => {
                                requestApprovalTable(className)
                                console.log(data)
                            })
                    })
                    button2.addEventListener("click", function () {
                        const studentName = this.getAttribute('studentName');

                        fetch("/cancelApplication", {
                            method: "POST",
                            body: JSON.stringify({ className: className, studentName: studentName }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(respsone => respsone.json())
                            .then(data => {
                                requestApprovalTable(className)
                                console.log(data)
                            })
                    })


                    nameCell.textContent = item.name
                    classCell.textContent = item.class
                    // applicationCell.textContent = item.applicationName

                    let applicationLink = document.createElement("a")
                    applicationLink.href = `../static/data/applications/${item.applicationName}`
                    applicationLink.innerHTML = item.applicationName
                    applicationLink.target = "_blank";

                    applicationCell.appendChild(applicationLink)

                    DateFromCell.textContent = item.date_from
                    dateToCell.textContent = item.date_to
                    buttonCell.appendChild(button)
                    buttonCell2.appendChild(button2)
                })


                document.getElementById("application-requests").innerHTML = ""
                document.getElementById("application-requests").appendChild(tableElement)


            } else {
                document.getElementById("application-requests").innerHTML = ""

                const tableElement = document.createElement("table");


                const headerRow = tableElement.insertRow(0);

                const studentName = headerRow.insertCell(0);
                const studentClass = headerRow.insertCell(1);
                const applicationName = headerRow.insertCell(2);
                const date_from = headerRow.insertCell(3);
                const date_to = headerRow.insertCell(4);
                headerRow.className = "header-row"

                studentName.textContent = "Name"
                studentClass.textContent = "Class"
                applicationName.textContent = "application"
                date_from.textContent = "date from"
                date_to.textContent = "date to"

                const row = tableElement.insertRow(-1)

                const msg = row.insertCell(0);
                msg.textContent = "No More Applications Today"
                document.getElementById("application-requests").appendChild(tableElement)


            }


        })

}



document.getElementById("pin-gen-btn").addEventListener("click", function () {

    document.getElementById("application-requests").innerHTML = "";

    let pinDiv = document.createElement("div");
    pinDiv.className = "pin-div";


    let pinInput = document.createElement("input");
    pinInput.type = "text";
    let heading = document.createElement("h4");
    heading.innerText = "Generate new pin";
    heading.className = "pin-heading";
    pinInput.placeholder = "Enter a number pin...";
    pinInput.id = "pin-input";

    let okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.id = "ok-btn";
    okBtn.className = "ok-btn";


    pinDiv.appendChild(heading);
    pinDiv.appendChild(pinInput);
    pinDiv.appendChild(okBtn);

    document.getElementById("application-requests").appendChild(pinDiv);

    pinInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            // Trigger the action when Enter key is pressed
            handlePinReset();
        }
    });

    okBtn.addEventListener("click", handlePinReset);

    // Function to handle pin reset
    function handlePinReset() {
        let enteredPin = pinInput.value;
        if (enteredPin !== "") {

            let resetConfirmation = confirm("The pin will be reset. Continue?");
            if (resetConfirmation) {

                fetch("/AdminKeyReset", {
                    method: "POST",
                    body: JSON.stringify({ adminPin: enteredPin }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    console.log("Pin reset confirmed");
                });



            } else {
                console.log("Pin reset canceled");
            }
        } else {
            alert("Please enter a pin before proceeding.");
        }
    }
});


document.getElementById("Approved-applications").addEventListener("click", function () {
    document.getElementById("application-requests").innerHTML = "";

    fetch("/AllApprovedApplications", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data)



            const tableElement = document.createElement("table");


            const headerRow = tableElement.insertRow(0);

            const studentName = headerRow.insertCell(0);
            const studentClass = headerRow.insertCell(1);
            const applicationName = headerRow.insertCell(2);
            const date_from = headerRow.insertCell(3);
            const date_to = headerRow.insertCell(4);
            headerRow.className = "header-row"

            studentName.textContent = "Name"
            studentClass.textContent = "Class"
            applicationName.textContent = "application"
            date_from.textContent = "date from"
            date_to.textContent = "date to"




            // Create and append rows for each student's attendance percentage
            data.forEach((item) => {
                const row = tableElement.insertRow(-1)

                const nameCell = row.insertCell(0);
                const classCell = row.insertCell(1);
                const applicationCell = row.insertCell(2)
                const DateFromCell = row.insertCell(3)
                const dateToCell = row.insertCell(4)



                nameCell.textContent = item.name
                classCell.textContent = item.class
                DateFromCell.textContent = item.date_from
                dateToCell.textContent = item.date_to

                let applicationLink = document.createElement("a")
                applicationLink.href = `../static/data/applications/${item.applicationName}`
                applicationLink.innerHTML = item.applicationName
                applicationLink.target = "_blank";

                applicationCell.appendChild(applicationLink)

            })
            document.getElementById("application-requests").appendChild(tableElement)

        })
})


document.getElementById("class-list").addEventListener("click", function () {
    fetch("/GetclassList", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            document.getElementById("application-requests").innerHTML = "";
            console.log(data)

            let tableElement = document.createElement("table");
            let headerRow = tableElement.insertRow(0);
            headerRow.className = "header-row"

            let HeadingCell = headerRow.insertCell(0);
            HeadingCell.textContent = "Current Classes"

            for (let i = 0; i < data.length; i++) {
                let row = tableElement.insertRow(i + 1);
                let cell = row.insertCell(0);

                let classLink = document.createElement("a")
                classLink.href = `../static/data/classesRecord/${data[i]}`
                classLink.innerHTML = data[i]
                classLink.target = "_blank";

                cell.textContent = "";
                cell.appendChild(classLink);
            }

            document.getElementById("application-requests").appendChild(tableElement)

        })
})

document.getElementById("Create-account").addEventListener("click", function () {
    document.getElementById("application-requests").innerHTML = "";

    createForm();

})


// Function to create the form dynamically
function createForm() {
    let formElement = document.createElement("form");
    formElement.id = "auth-Form";

    let heading = document.createElement("h4");
    heading.textContent = "Make a new account";
    formElement.appendChild(heading);

    function createInput(type, id, placeholder, required) {
        let inputElement = document.createElement("input");
        inputElement.type = type;
        inputElement.id = id;
        inputElement.name = id;
        inputElement.placeholder = placeholder;
        inputElement.required = required;
        return inputElement;
    }

    // Create input for student name
    let nameInput = createInput("text", "acc-name", "account Name", true);
    formElement.appendChild(nameInput);

    // Create input for roll number
    let rollNumberInput = createInput("text", "acc-rollNumber", "Roll Number(only for sudent)", false);
    formElement.appendChild(rollNumberInput);

    // Create input for student class
    let classInput = createInput("text", "acc-class", "Class", true);
    formElement.appendChild(classInput);

    // Create input for username
    let usernameInput = createInput("text", "username", "Username", true);
    formElement.appendChild(usernameInput);

    // Create input for password
    let passwordInput = createInput("password", "password", "Password", true);
    formElement.appendChild(passwordInput);

    // Create dropdown menu for account type
    let authTypeDropdown = document.createElement("select");
    authTypeDropdown.id = "authType";
    authTypeDropdown.name = "authType";
    authTypeDropdown.required = true;

    let defaultOption = document.createElement("option");
    defaultOption.text = "Select Account Type";
    defaultOption.value = "";
    authTypeDropdown.appendChild(defaultOption);

    let studentOption = document.createElement("option");
    studentOption.text = "Student";
    studentOption.value = "studentsignup";
    authTypeDropdown.appendChild(studentOption);

    let teacherOption = document.createElement("option");
    teacherOption.text = "Teacher";
    teacherOption.value = "facultySignup";
    authTypeDropdown.appendChild(teacherOption);

    formElement.appendChild(authTypeDropdown);


    let authSubmitBtn = document.createElement("button");
    authSubmitBtn.type = "submit";
    // authSubmitBtn.id = "submitBtn";
    authSubmitBtn.textContent = "Create account";
    formElement.appendChild(authSubmitBtn);


    authSubmitBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById("acc-name").value,
            rollNumber: document.getElementById("acc-rollNumber").value,
            CLASS: document.getElementById("acc-class").value,
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
            authType: document.getElementById("authType").value,
        };

        fetch("/createAuthAccount", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);

                if (data.message === "New authentication account created") {
                    // Clear form inputs on successful account creation
                    document.getElementById("acc-name").value = "";
                    document.getElementById("acc-rollNumber").value = "";
                    document.getElementById("acc-class").value = "";
                    document.getElementById("username").value = "";
                    document.getElementById("password").value = "";

                    authSubmitBtn.textContent = "Account Created";
                }
            })
            .catch(error => console.error('Error:', error));
    });



    document.getElementById("application-requests").appendChild(formElement)
}


document.getElementById("current-student-accounts").addEventListener("click", function () {
    fetch("/currentStudentAccounts", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data);

            let table = document.createElement('table');
            // table.border = '1';

            // Create table header
            let thead = document.createElement('thead');
            let headerRow = document.createElement('tr');
            headerRow.className = "header-row"
            Object.keys(data[0]).forEach(key => {
                let th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            let tbody = document.createElement('tbody');
            data.forEach(obj => {
                let row = document.createElement('tr');
                Object.values(obj).forEach(value => {
                    let td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });

            table.appendChild(tbody);

            document.getElementById("application-requests").innerHTML = "";
            document.getElementById("application-requests").appendChild(table)
        })

})

document.getElementById("current-teachers-accounts").addEventListener("click", function () {
    fetch("/currentTeachersAccounts", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data);

            let table = document.createElement('table');
            // table.border = '1';

            // Create table header
            let thead = document.createElement('thead');
            let headerRow = document.createElement('tr');
            headerRow.className = "header-row"
            Object.keys(data[0]).forEach(key => {
                let th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            let tbody = document.createElement('tbody');
            data.forEach(obj => {
                let row = document.createElement('tr');
                Object.values(obj).forEach(value => {
                    let td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });

            table.appendChild(tbody);

            document.getElementById("application-requests").innerHTML = "";
            document.getElementById("application-requests").appendChild(table)
        })

})