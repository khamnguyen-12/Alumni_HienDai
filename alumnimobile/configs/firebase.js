// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQrXE8pIi9CtM-R-tvaHtS59HD9AOervM",
  authDomain: "kham-c3c84.firebaseapp.com",
  projectId: "kham-c3c84",
  storageBucket: "kham-c3c84.appspot.com",
  messagingSenderId: "642671009422",
  appId: "1:642671009422:web:9bfd83ba51895e0422f3df",
  measurementId: "G-HNQ6MBMRDN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getFirestore(app);
const db = getFirestore(app);
export { db };
