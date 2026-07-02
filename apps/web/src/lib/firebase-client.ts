// Firebase client SDK — browser only
// Used by PhoneAuthForm to trigger SMS and verify OTP
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
}

// Prevent duplicate app init on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const firebaseAuth = getAuth(app)
