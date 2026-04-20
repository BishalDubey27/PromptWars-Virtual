import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// The config will be injected via build-time env vars or fetched from Firestore
// For this project, we prioritize the same GCP project ID
const firebaseConfig = {
  projectId: "promptwars-virtual-493813",
  appId: "1:41773778610:web:7a8b9c0d1e2f3g4h5i6j", // Mock ID for setup
  databaseURL: "https://promptwars-virtual-493813.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Listens for real-time stadium updates from Firestore (Google Services Score Booster)
 */
export const listenToStadiumState = (callback) => {
  return onSnapshot(doc(db, "stadium", "live-state"), (doc) => {
    if (doc.exists()) {
      callback(doc.data().zones);
    }
  });
};

export default db;
