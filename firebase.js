const { auth, database } = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { ref, get, update } = require("firebase/database");
const { readFileSync } = require("fs");
const { config } = require("dotenv");

config();
const fishesData = JSON.parse(readFileSync("./www/assets/data/fishes.json", {encoding: 'utf8'}));
const insectssData = JSON.parse(readFileSync("./www/assets/data/insects.json", {encoding: 'utf8'}));
const seaCreaturesData = JSON.parse(readFileSync("./www/assets/data/sea_creatures.json", {encoding: 'utf8'}));
const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const app = initializeApp({
  credential: applicationDefault(),
  databaseURL: process.env.DB_URL
})
const authentication = auth();
const db = database(app);

const getLeaderBoard = async () => {
  const snapshot = await get(ref(db, "users/"))
  const values = snapshot.val()

  if (values == null || values == undefined) {
    return [];
  }
  
  return Object.values(snapshot.val())
}

const getUsers = async (uid) => {
  if (!isAdmin(uid)) {
    return false;
  }

  const usersSnap = await get(ref(db, "users/"));
  const registeredUsers = usersSnap.val();

  Object.keys(registeredUsers).forEach(uid => {
    delete registeredUsers[uid]["fishes"];
    delete registeredUsers[uid]["insects"];
    delete registeredUsers[uid]["sea_creatures"];
    delete registeredUsers[uid]["friend_code"];
    delete registeredUsers[uid]["webPush"];
  });

  return registeredUsers;
}

const setAdmin = async (uid, shouldElevate, newAdmin) => {
  dataToUpdate = {}
  if (!isAdmin(uid)) {
    return false;
  }

  dataToUpdate[`users/${newAdmin}/isAdmin`] = shouldElevate;
  await update(ref(db, ), dataToUpdate);

  return true;
}

const deleteUserData = async (uid, userToDelete) => {
  const updates = {};
  if (!isAdmin(uid)) {
    return false;
  }

  await authentication.deleteUser(userToDelete)
  updates[`users/${userToDelete}`] = null;
  await update(ref(db), updates);

  return true;
}

const sendPushNotifications = async () => {
  const usersSnap = await get(ref(db, "users/"));
  const notifications = generateNotificationMessages(usersSnap.val());
  getMessaging().sendAll(notifications).then(e => {
    e.responses.forEach(res => {
      if (!res.success) {
        console.log("Notifications: ", res.error);
      } else {
        console.log("Notifications: SUCCESS");
      }
    })
  });
}

async function isAdmin(uid) {
  const retVal = await get(ref(db, `users/${uid}/isAdmin`)).catch(() => false);

  return (retVal)? retVal.val() : false;
}

function generateNotificationMessages(users) {
  const currentMonth = new Date().getMonth();
  const notifications = [];

  Object.values(users).forEach(user => {
    const fishes = [];
    Object.values(fishesData).forEach(fish => {
      if ("fishes" in user && !(fish.name.replaceAll(" ", "") in user.fishes) && checkCollectibleInPeriod(fish.period, currentMonth)) {
        fishes.push(fish.name);
      }
    });
    if (fishes.length > 3) { 
      fishes.splice(3, fishes.length-2);
      fishes[3] = "..."
    }

    const insects = [];
    Object.values(insectssData).forEach(insect => {
      if ("insects" in user && !(insect.name.replaceAll(" ", "") in user.insects) && checkCollectibleInPeriod(insect.period, currentMonth)) {
        insects.push(insect.name);
      }
    });
    if (insects.length > 3) { 
      insects.splice(3, insects.length-2);
      insects[3] = "..."
    }

    const seaCreatures = [];
    Object.values(seaCreaturesData).forEach(seaCreature => {
      if ("sea_creatures" in user && !(seaCreature.name.replaceAll(" ", "") in user["sea_creatures"]) && checkCollectibleInPeriod(seaCreature.period, currentMonth)) {
        seaCreatures.push(seaCreature.name);
      }
    });
    if (seaCreatures.length > 3) { 
      seaCreatures.splice(3, seaCreatures.length-2);
      seaCreatures[3] = "..."
    }

    let body = ""
    if (insects.length) {
      body += `Insetti: ${insects.join(", ")}\n`;
    }
    if (fishes.length) {
      body += `Pesci: ${fishes.join(", ")}\n`;
    }
    if (seaCreatures.length) {
      body += `Creature marine: ${seaCreatures.join(", ")}`;
    }

    if (body != "" && "webPush" in user) {
      Object.values(user.webPush).forEach(token => {
        notifications.push({
          notification: {title: "AC:NH Manager", "body": body},
          "token": token
        });
      });
    }
  });

  return notifications;
}

function checkCollectibleInPeriod(period, currentMonth) {
  if (!period) {
    return true;
  } else if (period.length == 1) {
    return months[currentMonth] == period[0];
  }

  let isInRange = false

  for (let index=0; index<period.length; index += 2) {
    const startPeriod = months.indexOf(period[index]);
    const endPeriod = months.indexOf(period[index+1]);

    if (startPeriod > endPeriod) {
        isInRange |= currentMonth >= startPeriod || currentMonth <= endPeriod
    } else {
        isInRange |= currentMonth >= startPeriod && currentMonth <= endPeriod
    }
  }

  return isInRange;
}

module.exports = { getLeaderBoard, getUsers, setAdmin, deleteUserData, sendPushNotifications, isAdmin };