import { authUser } from './user.js';

const welcomeField = document.querySelector("#welcome");
const userDiv = document.querySelector("#navbar > .navbar-end")
const registerDiv = document.querySelector("#registerDiv");
const loginDiv = document.querySelector("#loginDiv");
const registerBtn = registerDiv.querySelector("button");
const loginBtn = loginDiv.querySelector("button");
const chatBtn = document.querySelector("a[href='chat.html']");
const encyclopedia = document.querySelector(".navbar-start > .has-dropdown")

function gainAccess(action) {
    if (action == "register") {
        const email = registerDiv.querySelector('input[name="email"]').value;
        const username = registerDiv.querySelector('input[name="username"]').value;
        const password = registerDiv.querySelector('input[name="password"]').value;
        
        authUser.register(email, username, password, updateHome)
    } else {
        const email = loginDiv.querySelector('input[name="email"]').value;
        const password = loginDiv.querySelector('input[name="password"]').value;
        
        authUser.login(email, password, updateHome);
    }
}

function updateHome() {
    if (localStorage.length > 3) {
        const username = localStorage.getItem("username");
        welcomeField.innerText = `Howdy ${username}! ☺️`
        usernameField.innerText = username;

        loginDiv.parentElement.classList.add("is-hidden");
        welcomeField.classList.remove("is-hidden");
        userDiv.classList.remove("is-hidden");
        (localStorage.getItem("isAdmin") == "true")? adminPanel.classList.remove("is-hidden") : adminPanel.classList.add("is-hidden");
        chatBtn.classList.remove("is-hidden");
        encyclopedia.classList.remove("is-hidden");
    } else {
        chatBtn.classList.add("is-hidden");
        encyclopedia.classList.add("is-hidden");
    }
}

loginBtn.addEventListener('click', () => gainAccess("login"));
registerBtn.addEventListener('click', () => gainAccess("register"));
window.addEventListener('load', () => updateHome());
registerDiv.addEventListener('keypress', (e) => {
    if (e.key == "Enter") {
        registerBtn.disabled = true;
        gainAccess("register");
    }
});
loginDiv.addEventListener('keypress', (e) => {
    if (e.key == "Enter") {
        loginBtn.disabled = true;
        gainAccess("login");
    }
});