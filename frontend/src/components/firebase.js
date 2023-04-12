// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
  const firebaseConfig = {
    apiKey: "AIzaSyBa47XVUVmTHdm6FY-KUD-n5sjkhA2fHIM",
    authDomain: "react-push-f2700.firebaseapp.com",
    projectId: "react-push-f2700",
    storageBucket: "react-push-f2700.appspot.com",
    messagingSenderId: "669268890217",
    appId: "1:669268890217:web:b76ad113b0f429039008f8",
    measurementId: "G-Q8LPDWTTTH",
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const messaging = getMessaging(app);
