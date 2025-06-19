import { initializeApp } from "firebase/app";
import { getAuth }     from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyDCF45N63yjNY6YHom7aTZiN9-1J4kpaoI",
  authDomain: "nquizict.firebaseapp.com",
  projectId: "nquizict",
  storageBucket: "nquizict.firebasestorage.app",
  messagingSenderId: "200855737323",
  appId: "1:200855737323:web:b08cd57759c7cdb6937fae",
  measurementId: "G-XH828Y3BQ7"

};
const app = initializeApp(config);
export const auth = getAuth(app);
export const db   = getFirestore(app);
