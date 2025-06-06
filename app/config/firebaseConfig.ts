// app/config/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
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
const app = initializeApp(firebaseConfig);

// لا تستدعي getAnalytics هنا كي لا يحاول الوصول إلى window أثناء SSR
// إذا أردت تفعيل التحليلات، يمكنك فعل ذلك في useEffect داخل مكوّن client-only.
// مثال داخل مكوّن React:
// useEffect(() => {
//   if (typeof window !== "undefined") {
//     import("firebase/analytics").then(({ getAnalytics }) => {
//       getAnalytics(app);
//     });
//   }
// }, []);

const storage = getStorage(app);
const firestore = getFirestore(app);

export { storage, firestore };
