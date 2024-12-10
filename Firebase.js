import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDUwSQ8RlDzcwPY5Eq2wdmpLKRHqSw9NHw",
    authDomain: "plm-fleet.firebaseapp.com",
    projectId: "plm-fleet",
    storageBucket: "plm-fleet.appspot.com",
    messagingSenderId: "581262701095",
    appId: "1:581262701095:web:9cebef65a6c3d3f6f45402"
  };

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
