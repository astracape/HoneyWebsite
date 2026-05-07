

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { browserLocalPersistence, getAuth, GoogleAuthProvider} from "firebase/auth";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: "honey-8e04f.firebaseapp.com",
//   projectId: "honey-8e04f",
//   storageBucket: "honey-8e04f.appspot.com",
//   messagingSenderId: "963671711531",
//   appId: "1:963671711531:web:62bd088210cd64d08b6f6e"
// };
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "capenaturals-db5cf.firebaseapp.com",
  projectId: "capenaturals-db5cf",
  storageBucket: "capenaturals-db5cf.firebasestorage.app",
  messagingSenderId: "257726321624",
  appId: "1:257726321624:web:22484e3e1f12e6b3b9d8ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export{database,storage,auth,provider}
