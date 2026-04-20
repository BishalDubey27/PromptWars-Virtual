import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey,
  authDomain: "promptwars-virtual-493813.firebaseapp.com",
  projectId: "promptwars-virtual-493813",
  storageBucket: "promptwars-virtual-493813.appspot.com",
  messagingSenderId: "41773778610",
  appId: "1:41773778610:web:7a8b9c0d1e2f3g4h5i6j",
  databaseURL: "https://promptwars-virtual-493813.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Auth is only usable when a valid API key is present
const auth = apiKey ? getAuth(app) : null;
const provider = apiKey ? new GoogleAuthProvider() : null;

export const loginWithGoogle = async () => {
  if (!auth || !provider) {
    console.warn("[Firebase] Auth unavailable — set VITE_FIREBASE_API_KEY in client/.env");
    return null;
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};

export const listenToStadiumState = (callback) => {
  return onSnapshot(doc(db, "stadium", "live-state"), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().zones);
    }
  }, (err) => {
    console.warn("[Firestore] listenToStadiumState error:", err.message);
  });
};

export { db, auth };
