// app/config/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const isDeve = true;
const firebaseConfigDev = {
  apiKey: "AIzaSyDXPm3Ws0i3_fuc7mNbrOgPLssvWvBnny8",
  authDomain: "light-for-gaza.firebaseapp.com",
  projectId: "light-for-gaza",
  storageBucket: "light-for-gaza.firebasestorage.app",
  messagingSenderId: "1023421028034",
  appId: "1:1023421028034:web:a31497d63e16931faacd5b",
  measurementId: "G-VTGWCY63FD",
};

const firebaseConfigProd = {
  apiKey: "AIzaSyCQaVpqtdcUZjA9GSsxDVPMMmXAdhml7k4",
  authDomain: "ultra-gizmo.firebaseapp.com",
  databaseURL:
    "https://ultra-gizmo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ultra-gizmo",
  storageBucket: "ultra-gizmo.appspot.com",
  messagingSenderId: "568246124028",
  appId: "1:568246124028:web:c475b41a42ea30250fc679",
};

// Initialize Firebase App
const app = initializeApp(isDeve ? firebaseConfigDev : firebaseConfigProd);

const storage = getStorage(app);
const firestore = getFirestore(app);

export { storage, firestore };
