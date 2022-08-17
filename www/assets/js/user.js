import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, updateEmail, deleteUser, sendPasswordResetEmail, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js';
import { getDatabase, ref, get, remove, push, update } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js';
import { getMessaging, getToken } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-messaging.js';
import { PUSH_NOTIFICATIONS_CONFIG, FIREBASE_CONFIG } from "./config.js";

if (window.location.pathname != "/" && window.location.pathname != "/leaderboard.html" && localStorage.length < 4) {
    window.location.href = "/";
}

const usernameField = document.querySelector("#usernameField");
const adminPanel = document.querySelector("#adminPanel");
const userDiv = document.querySelector("#navbar > .navbar-end");
const logoutButton = usernameField.parentElement.querySelectorAll("div > a")[3];

usernameField.innerText = localStorage.getItem("username");
(localStorage.getItem("isAdmin") == "true")? adminPanel.classList.remove("is-hidden") : adminPanel.classList.add("is-hidden");
(localStorage.getItem("username"))? userDiv.classList.remove("is-hidden") : userDiv.classList.add("is-hidden");
logoutButton.addEventListener("click", () => authUser.disconnect())
document.addEventListener('DOMContentLoaded', () => {
    // Service Worker
    if (navigator.serviceWorker) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
    }

    // Navbar items on tablets
    const $navbarItems = Array.prototype.slice.call(document.querySelectorAll(".navbar-item.has-dropdown"), 0);
    $navbarItems.forEach( el => {
        el.addEventListener('click', () => {
            el.classList.toggle('.is-active');
        })
    })

    // Hamburger menu
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {
            const target = el.dataset.target;
            const $target = document.getElementById(target);
    
            el.classList.toggle('is-active');
            $target.classList.toggle('is-active');
        });
    });
});

class Firebase {
    constructor() {
        const app = initializeApp(FIREBASE_CONFIG);
        this.auth = getAuth(app);
        this.db = getDatabase(app);
        this.messaging = getMessaging(app);
    }

    setUser() {
        return new Promise((res, rej) => {
            this.auth.onAuthStateChanged(user => {
                this.user = user;
                res();
            }, r => rej(r));
        });
    }

    disconnect() {
        this.auth.signOut();
        window.localStorage.clear();
        window.location.href = "/";
    }
    
    async setUserOnStorage() {
        if (this.user == undefined) {
            this.disconnect();
        }

        const userSnapshot = await get(ref(this.db, `users/${this.user.uid}`));
        const userData = userSnapshot.val()
        window.localStorage.setItem("username", userData.username);
        window.localStorage.setItem("email", this.user.email);
        window.localStorage.setItem("uid", this.user.uid);
        window.localStorage.setItem("isAdmin", (userData.isAdmin)? true : false)
    }

    register(email, username, password, callback) {
        createUserWithEmailAndPassword(this.auth, email, password)
        .then(user => {
            this.user = user.user;
            const dataToUpdate = {};
            dataToUpdate[`users/${user.user.uid}/username`] = username;
            dataToUpdate[`users/${user.user.uid}/email`] = email;
            
            update(ref(this.db), dataToUpdate);
            SnackBar({
                status: "success",
                message: "L'account è stato creato correttamente"
            })
            this.setUserOnStorage().then(() => callback());
        })
        .catch((e) => {
            document.querySelector("#registerDiv button").disabled = false;
            SnackBar({
                status: "danger",
                message: e
            });
        });
    }

    login(email, password, callback) {
        signInWithEmailAndPassword(this.auth, email, password)
        .then(user => {
            this.user = user.user;
            this.setUserOnStorage().then(() => callback());
        })
        .catch(e => {
            document.querySelector("#loginDiv button").disabled = false;
            SnackBar({
                status: "danger",
                message: e
            });
        });
    }

    async setUserNotID(token) {
        if (this.user == undefined) {
            this.disconnect();
        }

        await push(ref(this.db, `users/${this.user.uid}/webPush`), token);
    }

    async changeCategoryValue(category, key, shouldPush) {
        if (this.user == undefined) {
            this.disconnect();
        }

        if (shouldPush) {
            await push(ref(this.db, `users/${this.user.uid}/${category}`), key)
        } else {
            const dataToUpdate = {};
            const currentData = Object.values((await get(ref(this.db, `users/${this.user.uid}/${category}`))).val());
            
            currentData.splice(currentData.indexOf(key), 1);
            dataToUpdate[`users/${this.user.uid}/${category}`] = currentData;
            
            await update(ref(this.db), dataToUpdate);
        }
    }

    async getFromCategory(category) {
        if (this.user == undefined) {
            this.disconnect();
        }

        const snapshot = await get(ref(this.db, `users/${this.user.uid}/${category}`)).catch(() => this.disconnect());
        const values = snapshot.val()

        return (values)? Object.values(snapshot.val()) : [];
    }

    updateProfile(email, password, friendCode) {
        if (this.user == undefined) {
            this.disconnect();
        }

        const dataToUpdate = {};
        dataToUpdate[`users/${this.user.uid}/friend_code`] = friendCode;

        if (email != "") {
            dataToUpdate[`users/${this.user.uid}/email`] = email;
            updateEmail(this.user, email);
            window.localStorage.setItem("email", email);
        }
        update(ref(this.db), dataToUpdate);

        if (password != "") {
            updatePassword(this.user, password);
        }
    }

    deleteMe() {
        if (this.user == undefined) {
            this.disconnect();
        }

        remove(ref(this.db, `users/${this.user.uid}/`));
        deleteUser(this.auth.currentUser.user)
        .then(() => SnackBar({
                status: "success",
                message: "Account eliminato correttamente"
            })
        )
        .catch(e => SnackBar({
            status: "danger",
            message: e
        }))
    }

    async getMe() {
        if (this.user == undefined) {
            this.disconnect();
        }

        const snapshot = await get(ref(this.db, `users/${this.user.uid}`))
        .catch(e => {
            SnackBar({
                status: "danger",
                message: e
            });
            this.disconnect();
        });

        return snapshot.val();
    }

    async shouldPushToken(token) {
        const webPushSnap = await get(ref(this.db, `users/${this.user.uid}/webPush`)).catch(() => []);
        const webPushVal = webPushSnap.val();        
        const res = (webPushVal)? Object.values(webPushVal).includes(token) : false;

        if (res) {
            SnackBar({message: "Notifiche già attive!"});
        }

        return !res;
    }

    async requestPushNotifications() {
        // Request permissions
        Notification.requestPermission()
        .then(permission => {
            if (permission == "granted") {
                // Don't worry, also this is a public key
                getToken(this.messaging, PUSH_NOTIFICATIONS_CONFIG)
                .then(currentToken => {
                    this.shouldPushToken(currentToken)
                    .then(shouldBePushed => {
                        if (currentToken && shouldBePushed) {
                            this.setUserNotID(currentToken);
                            SnackBar({
                                status: "success",
                                message: "Riceverai mensilmente notifiche su cosa puoi ottenere!"
                            })
                        }
                    });
                });
            }
        })
    }

    resetPassword(email) {
        sendPasswordResetEmail(this.auth, email)
        .then(() => SnackBar({
            status: "success",
            message: "Email di recupero inviata"
        }))
        .catch(e => SnackBar({
            status: "danger",
            message: e
        }));
    }
}

const authUser = new Firebase();
export { authUser };