import { authUser } from "./user.js";

const cardContent = document.querySelector(".card-content");
const usernameCard = cardContent.querySelector(".title");
const emailCard = cardContent.querySelector("input[type='email']");

const insects = cardContent.querySelector("span[data='insects']");
const fishes = cardContent.querySelector("span[data='fishes']");
const seaCreatures = cardContent.querySelector("span[data='sea_creatures']");
const progresBars = cardContent.querySelectorAll("progress");

const notificationBtn = cardContent.querySelector(".card-footer > .has-text-link");
const saveBtn = cardContent.querySelector(".card-footer > .has-text-success");
const editBtn = cardContent.querySelector(".card-footer > .has-text-info");
const deleteBtn = cardContent.querySelector(".card-footer > .has-text-danger");

const friendCode = cardContent.querySelector("input[type='text']")
const passwordInput = cardContent.querySelector("input[type='password']");
const passwordContainer = cardContent.querySelector("#passwordContainer");

let passwordHasChanged = false;

authUser.setUser().then(() =>
    authUser.getMe().then(data => {
        const insectsLen = (data["insects"])?Object.values(data.insects).length : 0;
        const fishesLen = (data.fishes)?Object.values(data.fishes).length : 0;
        const seaCreaturesLen = (data["sea_creatures"])?Object.values(data["sea_creatures"]).length : 0;

        insects.innerText += insectsLen;
        progresBars[0].value = insectsLen;
        fishes.innerText += fishesLen;
        progresBars[1].value = fishesLen;
        seaCreatures.innerText += seaCreaturesLen;
        progresBars[2].value = seaCreaturesLen;

        friendCode.value = (data["friend_code"])?data["friend_code"] : "";
    })
);

usernameCard.innerText = localStorage.getItem("username");
emailCard.value = localStorage.getItem("email");

notificationBtn.addEventListener("click", () => {
    authUser.requestPushNotifications();
})

saveBtn.addEventListener("click", () => {
    const pass = (passwordHasChanged)?passwordInput.value : "";
    friendCode.setAttribute("readonly", "");
    friendCode.classList.add("is-static");
    
    emailCard.setAttribute("readonly", "");
    emailCard.classList.add("is-static");

    passwordInput.value = "";
    passwordInput.setAttribute("readonly", "");
    passwordInput.classList.add("is-static");
    passwordContainer.classList.add("is-hidden");

    authUser.updateProfile(emailCard.value, pass, friendCode.value)

    saveBtn.classList.add("is-hidden");
    editBtn.classList.remove("is-hidden");
})

editBtn.addEventListener("click", () => {
    friendCode.removeAttribute("readonly");
    friendCode.classList.remove("is-static");

    emailCard.removeAttribute("readonly");
    emailCard.classList.remove("is-static");

    passwordInput.removeAttribute("readonly");
    passwordInput.classList.remove("is-static");
    passwordContainer.classList.remove("is-hidden");

    editBtn.classList.add("is-hidden");
    saveBtn.classList.remove("is-hidden");
})

deleteBtn.addEventListener("click", () => {
    authUser.deleteMe();
    localStorage.clear();
    window.location = "/";
})

passwordInput.addEventListener("change", () => {
    passwordHasChanged = true;
})