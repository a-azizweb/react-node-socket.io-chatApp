// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyBa47XVUVmTHdm6FY-KUD-n5sjkhA2fHIM",
  authDomain: "react-push-f2700.firebaseapp.com",
  projectId: "react-push-f2700",
  storageBucket: "react-push-f2700.appspot.com",
  messagingSenderId: "669268890217",
  appId: "1:669268890217:web:b76ad113b0f429039008f8",
  measurementId: "G-Q8LPDWTTTH",
};
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
