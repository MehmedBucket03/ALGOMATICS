// Modern Firebase v9 SDK approach
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCx6-682RUuFzMxDYtZrLMlC4EWUp5qgrU",
    authDomain: "algomatics-91e5f.firebaseapp.com",
    projectId: "algomatics-91e5f",
    storageBucket: "algomatics-91e5f.appspot.com",
    messagingSenderId: "564663119620",
    appId: "1:564663119620:web:5efcb64359cda2cab3aa51",
    measurementId: "G-H5HB75C3WW"
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized successfully");

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();console.log("Firebase services initialized");

export { auth, db, storage, provider };


