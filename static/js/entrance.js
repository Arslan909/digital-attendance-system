document.addEventListener("DOMContentLoaded", function () {
    const doneButton = document.getElementById("done-button");

    doneButton.addEventListener("click", function () {
        const className = document.getElementById("class-name-input").value;
        const userName = document.getElementById("username-input").value;
        const password = document.getElementById("password-input").value;

        const data = {
            class: className,
            username: userName,
            password: password
        };

        fetch('/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                window.location.href = response.url;
            } else {
                console.error("Authentication failed");
            }
        });
    })


    let adminControl = document.getElementById("adminControl")

    adminControl.addEventListener("click", function () {
        let EmailAuth = document.getElementById("page-1-container")
        EmailAuth.style.display = "none"
        adminControl.style.display = "none"


        let myDiv = document.createElement("div")
        myDiv.className = "adminAuthDiv"

        let myInput = document.createElement('input');
        myInput.type = 'password';
        myInput.placeholder = 'Enter admin pin...';

        let okBtn = document.createElement('button');
        okBtn.textContent = 'Ok';
        let cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'cancel';

        myDiv.appendChild(myInput);
        myDiv.appendChild(okBtn);
        myDiv.appendChild(cancelBtn);
        document.getElementById("entrance").appendChild(myDiv)


        okBtn.addEventListener('click', function () {
            fetch("/authAdmin", {
                method: "POST",
                body: JSON.stringify({ adminPin: myInput.value }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        window.location.href = `/form_page`;
                    }else{
                        throw new Error("Authentication unsuccessful");
                    }
                });
        })

        cancelBtn.addEventListener("click", function () {
            myDiv.style.display = "none"
            EmailAuth.style.display = "block"
            adminControl.style.display = "flex"
        })
    })
})
