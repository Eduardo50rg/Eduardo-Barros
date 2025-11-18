// IMPORTANT: Replace this with your actual Firebase project configuration.
// Go to your Firebase project console -> Project settings -> General tab -> Your apps -> Web app -> Config.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyB3-JRUPhg_Ku2Qb8g814u5JGX2scv1wqE",
  authDomain: "nupdec-socorristas.firebaseapp.com",
  databaseURL: "https://nupdec-socorristas-default-rtdb.firebaseio.com",
  projectId: "nupdec-socorristas",
  storageBucket: "nupdec-socorristas.appspot.com",
  messagingSenderId: "794375706761",
  appId: "1:794375706761:web:a4f7c741f6f29729a30e58",
  measurementId: "G-FZ7B92ZT3R"
};

// Initialize Firebase
// FIX: Ensure Firebase is not initialized more than once
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Export instances for use in other parts of the app
export const auth = firebase.auth();
export const db = firebase.firestore();