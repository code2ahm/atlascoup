import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBpvc3W7oPxw1RECDRmeTjyw3DuWT0goBc",
  authDomain: "atlcoup.firebaseapp.com",
  projectId: "atlcoup",
  storageBucket: "atlcoup.appspot.com",
  messagingSenderId: "420534898644",
  appId: "1:420534898644:web:61341c070ca79043910abc",
  measurementId: "G-492TK2FTN7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence);

export default app;
