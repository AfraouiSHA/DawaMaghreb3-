// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWokAbWcCWsiJ3D0klDJ5ugDOEHvT0RHU",
    authDomain: "dawamaghreb-18549.firebaseapp.com",
    projectId: "dawamaghreb-18549",
    storageBucket: "dawamaghreb-18549.appspot.com",
    messagingSenderId: "679886522189",
    appId: "1:679886522189:web:1503e8d05760fd84ba5904",
    measurementId: "G-KZ927C3J3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);