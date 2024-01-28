document.addEventListener("DOMContentLoaded", function () {
    const resultDiv = document.getElementById("result");
    
    fetch("/get_data")
    .then(response => response.json())
    .then(data => {

        // console.log(data)
        var tableBody = document.getElementById("table-body");

        data.forEach(function(item) {
            var row = tableBody.insertRow();

            var nameCell = row.insertCell(0);
            var rollNumberCell = row.insertCell(1);
            var classCell = row.insertCell(2);

            // var checkboxCell = row.insertCell(3);
            // var checkbox = document.createElement("input");
            // checkbox.type = "checkbox";
            // checkboxCell.appendChild(checkbox);

            nameCell.innerHTML = item.name;
            rollNumberCell.innerHTML = item.rollNumber;
            classCell.innerHTML = item.class;
        })
        // resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    });
});
