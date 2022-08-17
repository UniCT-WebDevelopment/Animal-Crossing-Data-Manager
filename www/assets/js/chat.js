const messages = document.querySelector("#messages");
const messageInput = document.querySelector("input[type='text']");
const sendButton = document.querySelector("button");
const usersContainer = document.querySelector("#users > div");

const socket = io();

window.addEventListener("load", () => socket.emit("connected", localStorage.getItem("username")));
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});
sendButton.addEventListener("click", () => sendMessage());

socket.on("connected", (username, id) => {
    addNewUser(username, id);
});

socket.on("disconnected", (id) => {
    document.querySelector(`button[name="${id}"]`).remove();
});

socket.on("newMessage", (username, id, message) => {
    addNewMessage(message, username);
    addNewUser(username, id);
});


function sendMessage() {
    const message = messageInput.value;

    if (message.length) {
        messageInput.value = "";
        socket.emit("newMessage", message);
        addNewMessage(message);
    }
}

function addNewMessage(message, username = window.localStorage.getItem("username")) {
    const messageContainer = document.createElement("div");

    if (username == window.localStorage.getItem("username")) {
        messageContainer.classList.add("newmessage", "notification", "is-teal", "is-from-me");
    } else {
        messageContainer.classList.add("newmessage", "notification", "is-success");
    }

    const user = document.createElement("span");
    user.classList.add("has-text-weight-bold", "is-username", "ml-4");
    user.innerText = username;
    
    const body = document.createElement("span");
    body.classList.add("is-message", "ml-4");
    body.innerText = message;

    const currentTime = new Date();
    const time = document.createElement("span");
    time.classList.add("is-time", "has-text-right", "mr-4");
    time.innerText = `${currentTime.getHours()}:${currentTime.getMinutes()}`;

    messageContainer.append(body, time, user);
    messages.appendChild(messageContainer);
    messages.scrollTop = messages.scrollHeight;
}

function addNewUser(username, id) {
    if (document.querySelector(`button[name="${id}"]`) == null) {
        const randomColor = `rgb(${Math.random()*225 + 30}, ${Math.random()*225 + 30}, ${Math.random()*225 + 30})`;
        const newUser = document.createElement("button");
        newUser.classList.add("button", "is-outlined", "mx-2");
        newUser.setAttribute("disabled", "");
        newUser.setAttribute("name", id);
        newUser.setAttribute("style", `border-color: ${randomColor}`);
        newUser.innerText = username;

        usersContainer.append(newUser);
    }
}