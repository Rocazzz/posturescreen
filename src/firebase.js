import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJjVNUf4MO-j-teWOWVXeBYZkAvxjpYvY",
  authDomain: "posturescreen-5e0c9.firebaseapp.com",
  projectId: "posturescreen-5e0c9",
  storageBucket: "posturescreen-5e0c9.firebasestorage.app",
  messagingSenderId: "1060466476607",
  appId: "1:1060466476607:web:c5a28b91dc503e333fda8a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);