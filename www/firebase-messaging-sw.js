importScripts("https://www.gstatic.com/firebasejs/9.9.0/firebase-app-compat.js");
importScripts('https://www.gstatic.com/firebasejs/9.9.0/firebase-messaging-compat.js');

const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  databaseURL: ""
};

firebase.initializeApp(FIREBASE_CONFIG);
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.data.Site;
  const notificationOptions = {
    body: payload.data.body,
    click_action: "http://127.0.0.1"
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});