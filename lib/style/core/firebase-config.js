import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAj7VtPtFuTKwBlaKChF4K5C3z3NFz-hDY",
    authDomain: "calcbank-9a89c.firebaseapp.com",
    projectId: "calcbank-9a89c",
    storageBucket: "calcbank-9a89c.firebasestorage.app",
    messagingSenderId: "691941990740",
    appId: "1:691941990740:web:e4f79ba1bd03e1c124e8c1",
    measurementId: "G-HXE0264WKJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseAuth = auth;
window.firebaseSignIn = signInWithEmailAndPassword;
window.firebaseSignUp = createUserWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseOnAuthStateChanged = onAuthStateChanged;
window.firebaseGoogleProvider = GoogleAuthProvider;
window.firebaseSignInWithPopup = signInWithPopup;
window.firebaseSignInWithCustomToken = signInWithCustomToken;  // Для Яндекс

window.firebaseDb = db;
window.firestoreDoc = doc;
window.firestoreSetDoc = setDoc;
window.firestoreGetDoc = getDoc;
window.firestoreServerTimestamp = serverTimestamp;

window.dispatchEvent(new Event('firebaseReady'));