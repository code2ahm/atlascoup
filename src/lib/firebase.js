import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBSjiUAs9DO4z7lVKdj8pnFj8pioSFsBJM",
  authDomain: "atlscoup.firebaseapp.com",
  projectId: "atlscoup",
  storageBucket: "atlscoup.firebasestorage.app",
  messagingSenderId: "451427018442",
  appId: "1:451427018442:web:8466a4200f950b6501b633",
  measurementId: "G-XJ6RV6PYMX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence);

export default app;
