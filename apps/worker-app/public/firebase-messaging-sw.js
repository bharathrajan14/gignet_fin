// Firebase Cloud Messaging Service Worker for Worker App
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyGIGNET_DEMO_KEY_SIH26089",
  authDomain: "gignet-sih26089.firebaseapp.com",
  projectId: "gignet-sih26089",
  storageBucket: "gignet-sih26089.appspot.com",
  messagingSenderId: "1029384756",
  appId: "1:1029384756:web:a1b2c3d4e5f6"
};

if (firebase && firebase.initializeApp) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM Service Worker] Received background push notification:', payload);
    const notificationTitle = payload.notification?.title || '⚡ GIGNET Job Offer Alert!';
    const notificationOptions = {
      body: payload.notification?.body || 'New job dispatch available in your H3 hexagon zone!',
      icon: '/gignet-logo.png',
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
