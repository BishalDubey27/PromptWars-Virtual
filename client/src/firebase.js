import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  projectId: "promptwars-virtual-493813",
  appId: "1:41773778610:web:7a8b9c0d1e2f3g4h5i6j",
  databaseURL: "https://promptwars-virtual-493813.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};

export const listenToStadiumState = (callback) => {
  return onSnapshot(doc(db, "stadium", "live-state"), (doc) => {
    if (doc.exists()) {
      callback(doc.data().zones);
    }
  });
};

export { db, auth };
