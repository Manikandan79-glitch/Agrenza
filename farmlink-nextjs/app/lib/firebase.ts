"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

/**
 * Firebase client config, read from NEXT_PUBLIC_* env vars so nothing
 * secret ends up in the bundle (these keys are meant to be public — the
 * project is locked down via Firebase Auth settings + your backend's own
 * verification, not by hiding this config). Copy `.env.local.example` to
 * `.env.local` and fill these in from
 * Firebase Console → Project settings → General → Your apps → Web app.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/** Lazily initialize (and reuse) the Firebase app + Auth instance, client-side only. */
export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is client-only — call this inside a useEffect/event handler.");
  }
  if (!firebaseConfig.apiKey) {
    throw new Error(
      "Missing Firebase config. Copy .env.local.example to .env.local and fill in your Firebase project's web app keys."
    );
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (!auth) auth = getAuth(app);
  return auth;
}
