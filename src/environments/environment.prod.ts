// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVrImaVXJzKtqJ_TBQmBoDqpV-hfl_p-I",
  authDomain: "dawamaghreb-e3d42.firebaseapp.com",
  projectId: "dawamaghreb-e3d42",
  storageBucket: "dawamaghreb-e3d42.firebasestorage.app",
  messagingSenderId: "851332485020",
  appId: "1:851332485020:web:d1685338ef850db2220259",
  measurementId: "G-QDN2JY4MPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);