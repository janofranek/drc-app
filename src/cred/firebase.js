// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKG2jkG3aMTrvnZanACYLZi913Bzv6A9Q",
  authDomain: "drcapp-a5960.firebaseapp.com",
  projectId: "drcapp-a5960",
  storageBucket: "drcapp-a5960.appspot.com",
  messagingSenderId: "770210119859",
  appId: "1:770210119859:web:47a642edada06ba66370c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;