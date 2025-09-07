// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxlT0VdJM_xf2tzwHu0qnj2idJUN8Qc-c",
  authDomain: "majani-insurance-agent-dashbo.firebaseapp.com",
  projectId: "majani-insurance-agent-dashbo",
  storageBucket: "majani-insurance-agent-dashbo.firebasestorage.app",
  messagingSenderId: "855937243489",
  appId: "1:855937243489:web:42ba2cb06b5ee2bf5b8d20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export services to window for access from app.js
window.firebaseServices = {
  auth: auth,
  db: db
};

console.log("Firebase v9+ initialized successfully");
console.log("Auth:", auth);
console.log("Firestore:", db);
