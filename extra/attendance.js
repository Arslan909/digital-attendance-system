const urlParams = new URLSearchParams(window.location.search);
let className = urlParams.get("class");

// on deafult current date will be todays date so load attendance register table according to this date on page load
document.addEventListener("DOMContentLoaded", function () {

    //formating date to set the default value of date input to today's date
    let today = new Date();
    let date_selector = document.getElementById("date");

    let year = today.getFullYear().toString()
    let month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    let day = today.getDate().toString().padStart(2, '0');

    let formattedDate = `${year}-${month}-${day}`;
    date_selector.value = formattedDate;

    
    fetch("/get_data", {
        method: "POST",
        body: JSON.stringify({ className: className, date: formattedDate }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data)
        let tableBody = document.getElementById("table-body");

        data.forEach(function(item) {
            let row = tableBody.insertRow()
            
            let nameCell = row.insertCell(0)
            let rollNumberCell = row.insertCell(1)
            let classCell = row.insertCell(2);

            let checkboxCell = row.insertCell(3);
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";


            if ("status" in item) {
                if (item.status === "present") {
                    checkbox.checked = true;
                }
            } else {
                checkbox.checked = false;
            }

            checkboxCell.appendChild(checkbox);
            let keys =  Object.keys(item)
            
            // nameCell.innerHTML = item.name;
            // rollNumberCell.innerHTML = item.rollnumber;
            // classCell.innerHTML = item.class;
            nameCell.innerHTML = item[keys[1]];
            rollNumberCell.innerHTML = item[keys[2]];
            classCell.innerHTML = item[keys[0]];
        })
    })
});


// shit to do when pressing the save reocord button
document.getElementById("save-record").addEventListener("click", function() {
    
    let StudentsAttendanceRecord = {
        className: className,
        attendanceData: []
    };

    let currentAttendanceRecord = []
    let tableBody = document.getElementById("table-body");
    let rows = tableBody.getElementsByTagName("tr");

    let date_selector = document.getElementById("date")
    let current_date = date_selector.value
    console.log(current_date)
    currentAttendanceRecord.push(current_date)
    
    for(let i =0; i<rows.length; i++){
        let checkbox = rows[i].querySelector("input[type='checkbox']");

        let name = rows[i].cells[0].innerHTML
        let rollnumber = rows[i].cells[1].innerHTML
        let classInfo = rows[i].cells[2].innerHTML

        if (checkbox.checked) {

            studentInfo = {
                'name': name,
                'rollnumber': rollnumber,
                'class': classInfo,
                'status': "present"
            }
            currentAttendanceRecord.push(studentInfo) 
        }else{
            studentInfo = {
                'name': name,
                'rollnumber': rollnumber,
                'class': classInfo,
                'status': "absent"
            }
            currentAttendanceRecord.push(studentInfo)
        }
}
    StudentsAttendanceRecord.attendanceData.push(currentAttendanceRecord)
    // console.log(StudentsAttendanceRecord)

    fetch('save_record', {
        method: "POST",
        body: JSON.stringify(StudentsAttendanceRecord),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Attendance saved successfully');
        } else {
            console.error('Failed to Attendance data');
        }
    })
})

// reload the attendance register table according to date change
let date_selector = document.getElementById("date")
date_selector.addEventListener("change", function (event) {
    let currentSelectedDate = event.target.value;
    let tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    fetch("/get_data", {
        method: "POST",
        body: JSON.stringify({ className: className, date: currentSelectedDate }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data)
        data.forEach(function(item) {
            let row = tableBody.insertRow()
            
            let nameCell = row.insertCell(0)
            let rollNumberCell = row.insertCell(1)
            let classCell = row.insertCell(2);

            let checkboxCell = row.insertCell(3);
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";


            if ("status" in item) {
                if (item.status === "present") {
                    checkbox.checked = true;
                }
            } else {
                checkbox.checked = false;
            }

            checkboxCell.appendChild(checkbox);
            
            nameCell.innerHTML = item.name;
            rollNumberCell.innerHTML = item.rollnumber;
            classCell.innerHTML = item.class;
        })
    })

})


// PS- refactor this code to use on function for with event listners