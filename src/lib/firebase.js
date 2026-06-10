import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

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
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence);

const RECAPTCHA_V3_KEY = '6LdiLRctAAAAABIZmRn1RA7vKq7a-XqvoegWAF-u';
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

if (!isLocalhost && RECAPTCHA_V3_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_V3_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

export default app;
