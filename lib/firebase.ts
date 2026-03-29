import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { getStorage } from "firebase/storage"; // 🆕 Add this

const firebaseConfig = {
  apiKey: "AIzaSyD0ZsyMC8l_3NWdNGR05bRG_bNNgrdpVpA",
  authDomain: "jewellery-admin-f3337.firebaseapp.com",
  projectId: "jewellery-admin-f3337",
  storageBucket: "jewellery-admin-f3337.firebasestorage.app",
  messagingSenderId: "132673880864",
  appId: "1:132673880864:web:6aea06c3dd9484d95fcd45",
  measurementId: "G-WSH06G1DTZ"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 🆕 Export storage

if (typeof window !== "undefined") {
  setPersistence(auth, browserSessionPersistence)
    .then(() => console.log("Auth session isolation enabled"))
    .catch((err) => console.error("Persistence error:", err));
}

export const requestForToken = async () => {
  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { 
      vapidKey: 'BDbJdckgskhNPC9uhxFpdNa8q2nBxu1HQRji9qAjAhjtqG51H2wOCg7w84Kz6Cti_BOE72W5LMTJrtuzTfgBTC4' 
    });
    return token;
  } catch (err) { 
    console.log('Token error', err); 
  }
};