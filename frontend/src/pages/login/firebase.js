
// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCx6-682RUuFzMxDYtZrLMlC4EWUp5qgrU",
    authDomain: "algomatics-91e5f.firebaseapp.com",
    projectId: "algomatics-91e5f",
    storageBucket: "algomatics-91e5f.firebasestorage.app",
    messagingSenderId: "564663119620",
    appId: "1:564663119620:web:5efcb64359cda2cab3aa51",
    measurementId: "G-H5HB75C3WW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase initialized");