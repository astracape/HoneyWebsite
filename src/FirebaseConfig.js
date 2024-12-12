

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCciU7QWukCT8LT3ipxXy3e1Iws4r7waWw",
  authDomain: "honey-8e04f.firebaseapp.com",
  projectId: "honey-8e04f",
  storageBucket: "honey-8e04f.appspot.com",
  messagingSenderId: "963671711531",
  appId: "1:963671711531:web:62bd088210cd64d08b6f6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
 const auth = getAuth(app);
const storage = getStorage(app);

export{database,storage,auth}