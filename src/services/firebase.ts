import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA6-4T03AveqMAvlYYGTRrX1wWw4bBWNRw",
  authDomain: "fate-witcher-sheet.firebaseapp.com",
  projectId: "fate-witcher-sheet",
  storageBucket: "fate-witcher-sheet.firebasestorage.app",
  messagingSenderId: "702799281373",
  appId: "1:702799281373:web:ab2fde91ec89debec12f34"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where
};
export type { User };
