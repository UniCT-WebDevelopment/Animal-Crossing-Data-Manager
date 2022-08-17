const { readFileSync } = require("fs");
const { config } = require("dotenv");
const { createServer } = require("https");
const express = require("express");
const { Server } = require("socket.io");
const { getLeaderBoard, getUsers, setAdmin, deleteUserData, sendPushNotifications, isAdmin } = require("./firebase.js");
const cron = require("node-cron")

config();
const expressApp = express();
const httpServer = createServer({
    key: readFileSync(process.env.SSL_KEY),
    cert: readFileSync(process.env.SSL_CERT)
}, expressApp);
const io = new Server(httpServer, {});
const PORT = process.env.PORT || 5555;

// WS Chat

io.on("connection", (socket) => {
    socket.on("disconnected", () => {
        socket.broadcast.emit("disconnected", socket.id);
    });

    socket.on("connected", (username) => {
        socket.data.username = username;
        socket.broadcast.emit("connected", username, socket.id);
    });

    socket.on("newMessage", (message) => {
        socket.broadcast.emit("newMessage", socket.data.username, socket.id, message)
    });
})

// Express API

expressApp.use(express.json());
expressApp.use(express.urlencoded({extended:false}));

expressApp.get("/get/leaderboard", (_, res) => {
    const leaderboard = []
    getLeaderBoard()
    .then(users => {
        if (users !== false) {
            users.forEach( user => {
                const fishes = (user.fishes)?Object.values(user.fishes).length : 0;
                const insects = (user.insects)?Object.values(user.insects).length : 0;
                const sea_creatures = (user["sea_creatures"])?Object.values(user["sea_creatures"]).length : 0;

                const newUser = {
                    "username": user.username,
                    "score": fishes + insects + sea_creatures,
                    "fishes": fishes,
                    "insects": insects,
                    "sea_creatures": sea_creatures
                }
                leaderboard.unshift(newUser);
            })
            leaderboard.sort((a, b) => b.score - a.score).splice(50);
            res.json(leaderboard);
        } else {
            res.sendStatus(403);
        }
    })
})

expressApp.post("/get/users", (req, res) => {
    const {uid} = req.body;
    getUsers(uid).then(data => {
        if (data !== false) {
            res.json(data)
        } else {
            res.sendStatus(403);
        }
    })
})

expressApp.post("/set/admin", (req, res) => {
    const {uid, shouldElevate, op} = req.body;

    setAdmin(uid, shouldElevate, op)
    .then(isSuccessfull => {
        if (isSuccessfull) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    })
})

expressApp.post("/set/newPassword", (req, res) => {
    const {uid, op} = req.body;
    resetPass(uid, op)
    .then(isSuccessfull => {
        if (isSuccessfull) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    })
})

expressApp.post("/set/deleteData", (req, res) => {
    const {uid, op} = req.body;
    deleteUserData(uid, op)
    .then(isSuccessfull => {
        if (isSuccessfull) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    })
})

expressApp.post("/set/notification", (req, res) => {
    const {uid} = req.body;

    if (isAdmin(uid)) {
        sendPushNotifications();
        res.sendStatus(200);
    } else {
        res.sendStatus(403);
    }
})

expressApp.use(express.static("./www"));
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

// Schedule monthly push notifications
cron.schedule("0 9 1 * *", () => {
    sendPushNotifications()
    .then(() => console.log("Notifications sent!"));
})