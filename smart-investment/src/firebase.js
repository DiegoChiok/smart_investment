// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyD5p5vjvVqvVfjbzUgDhaZQIwS-uRj5q18",
  authDomain: "investment-app-57041.firebaseapp.com",
  projectId: "investment-app-57041",
  storageBucket: "investment-app-57041.firebasestorage.app",
  messagingSenderId: "419010766003",
  appId: "1:419010766003:web:3db838a9adbff9c9543cc6",
  measurementId: "G-JM510B8C8H"
};

const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
console.log("Firebase initialized:", app.name);

const db = getFirestore(app);
const auth = getAuth(app); 

export { db, auth, analytics }; 
