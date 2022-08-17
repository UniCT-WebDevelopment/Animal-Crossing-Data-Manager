import { authUser } from "./user.js";

if (!localStorage.getItem("isAdmin")) {
    window.location.href = "/";
}

const table = document.querySelector("table tbody")
const notificationButton = document.querySelector("button.is-primary");

window.addEventListener('load', () => {
    fetch(`/get/users`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"uid": localStorage.getItem("uid")})
    })
    .then(res => {
        if (res.status == 403) {
            disconnect(localStorage.getItem("uid"));
        }
        return res.json()
    })
    .then(users => {
        Object.keys(users).forEach(uid => {
            const userField = document.createElement("th")
            userField.classList.add("is-vcentered");
            userField.setAttribute("uid", uid);
            userField.setAttribute("email", users[uid].email);
            userField.innerText = users[uid].username;

            const colAdmin = document.createElement("td");
            const adminBtn = document.createElement("button");
            adminBtn.classList.add("button", "is-warning");
            adminBtn.innerHTML = "<span class='material-icons'>admin_panel_settings</span>Rendi amministratore"
            adminBtn.addEventListener("click", (e) => setAdmin(e))
            if (users[uid].isAdmin) {
                adminBtn.innerHTML = "<span class='material-icons'>not_interested</span>Rimuovi amministratore"
            }
            colAdmin.appendChild(adminBtn);

            const colPass = document.createElement("td");
            const passBtn = document.createElement("button");
            passBtn.classList.add("button", "is-info");
            passBtn.innerHTML = "<span class='material-icons'>lock_reset</span>Password reset";
            passBtn.addEventListener("click", (e) => resetPass(e))
            colPass.appendChild(passBtn);
            
            const colDel = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("button", "is-danger");
            deleteBtn.innerHTML = "<span class='material-icons'>delete_outline</span>Elimina dati";
            deleteBtn.addEventListener("click", (e) => deleteData(e))
            colDel.appendChild(deleteBtn);
            
            const row = document.createElement("tr");
            row.append(userField, colAdmin, colPass, colDel);
            table.appendChild(row);
        })
    })
})

notificationButton.addEventListener("click", () => {
    fetch("/set/notification", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"uid": localStorage.getItem("uid")})
    })
    .then(res => {
        if (res.status == 200) {
            SnackBar({
                status: "success",
                message: "Inoltro notifiche schedulato"
            })
        } else {
            SnackBar({
                status: "danger",
                message: "Qualcosa è andato storto..."
            })
        }
    })
})

function setAdmin(element) {

    const shouldElevate = element.target.innerText.includes("Rendi");
    fetch("/set/admin", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "uid": localStorage.getItem("uid"),
            "shouldElevate": shouldElevate,
            "op": element.target.parentElement.parentElement.querySelector("th[uid]").getAttribute("uid")
        })
    })
    .then(res => {
        if (res.status == 200) {
            element.target.innerText = (shouldElevate)? "Rimuovi amministratore" : "Rendi amministratore";
        } else {
            endSession()
        }
    })
}

function resetPass(element) {
    const userEl = element.target.parentElement.parentElement.querySelector("th[uid]")
    authUser.resetPassword(userEl.getAttribute("email"));
}

function deleteData(element) {
    fetch("/set/deleteData", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "uid": localStorage.getItem("uid"), 
            "op": element.target.parentElement.parentElement.querySelector("th[uid]").getAttribute("uid")
        })
    })
    .then(res => {
        if (res.status == 200) {
            SnackBar({
                status: "success",
                message: "Utente eliminato correttamente"
            })
            element.target.parentElement.parentElement.remove();
        } else {
            SnackBar({
                status: "danger",
                message: "Si è verificato un errore durante la cancellazione dell'account"
            })
        }
    })
}