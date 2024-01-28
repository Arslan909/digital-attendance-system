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

        // Read the contents of the CSV file
        let reader = new FileReader();
        reader.onload = function (event) {
            let csvData = event.target.result;
            // Convert CSV to JSON
            let jsonData = csvToJson(csvData);

            // Send JSON data to the server
            fetch('/upload_csv_json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to upload JSON data');
                    }
                })
        };

        reader.readAsText(file);
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

                // Create a table element
                const tableElement = document.createElement("table");

                // Create table header
                const headerRow = tableElement.insertRow(0);
                const studentName = headerRow.insertCell(0);
                const studentClass = headerRow.insertCell(1);
                const applicationName = headerRow.insertCell(2);
                const date_from = headerRow.insertCell(3);
                const date_to = headerRow.insertCell(4);

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

                    let buttonCell = row.insertCell(5);
                    let button = document.createElement('button');
                    button.innerHTML = 'approve';
                    button.className = 'approveBtn'
                    button.id = 'approveBtn'

                    button.setAttribute('studentName', item.name);

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
                })

                document.getElementById("application-requests").appendChild(tableElement)

            })
    })



})

