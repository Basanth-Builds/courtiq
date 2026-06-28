'use client'

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { firebaseConfig, isFirebaseConfigured } from './config'

let app: FirebaseApp | null = null
let auth: Auth | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.')
  }

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }

  return auth
}
