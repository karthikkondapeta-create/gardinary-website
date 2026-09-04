import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyA2Gv6a7ICpzyNRw6X3GpLpSqJ-YNfXDZM",
  authDomain: "gardinary-30c14.firebaseapp.com",
  projectId: "gardinary-30c14",
  storageBucket: "gardinary-30c14.firebasestorage.app",
  messagingSenderId: "572997151790",
  appId: "1:572997151790:web:eb360b48391bba145d83bf",
  measurementId: "G-RMZKKF3WJN"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
