import dotenv from 'dotenv';
dotenv.config();

let admin = null;
let firebaseInitialized = false;

export async function initFirebaseAdmin() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountJson) {
    try {
      const { default: adminSdk } = await import('firebase-admin');
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminSdk.initializeApp({
        credential: adminSdk.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'gignet-sih.appspot.com'
      });
      admin = adminSdk;
      firebaseInitialized = true;
      console.log('[Firebase] Initialized Firebase Admin SDK successfully.');
    } catch (err) {
      console.warn('[Firebase] Warning: Failed to parse FIREBASE_SERVICE_ACCOUNT. Falling back to Demo OTP Mode:', err.message);
    }
  } else {
    console.log('[Firebase] Running in Demo Mode (No FIREBASE_SERVICE_ACCOUNT configured). Google OAuth + Demo OTP active.');
  }
}

export function getFirebaseAdmin() {
  return admin;
}

export function isFirebaseReady() {
  return firebaseInitialized;
}
