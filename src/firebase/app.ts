import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';
import { FIREBASE_CONFIG, firebaseConfigured } from './config';

const app = firebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(FIREBASE_CONFIG)
  : null;

export const auth = app ? getAuth(app) : null;

/** Облако с офлайн-кэшем: без сети герои открываются из памяти браузера. */
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentSingleTabManager(undefined) }),
    })
  : null;

export const googleProvider = auth ? new GoogleAuthProvider() : null;

if (auth) {
  void setPersistence(auth, browserLocalPersistence).catch(() => {
    /* приватный режим — вход работает до закрытия вкладки */
  });
}
