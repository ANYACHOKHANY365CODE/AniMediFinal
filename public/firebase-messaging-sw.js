importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBrQ2zSKIDlyqZq2wA42XdkCfP8hTrkQFg",
  authDomain: "animedi-21cc8.firebaseapp.com",
  projectId: "animedi-21cc8",
  storageBucket: "animedi-21cc8.firebasestorage.app",
  messagingSenderId: "277484129751",
  appId: "1:277484129751:web:d85519aa323eb543714f92",
  measurementId: "G-WX5HGEQLWC"
});

const messaging = firebase.messaging();

// Always show a notification for background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  let notificationTitle = 'AniMedi Reminder';
  let notificationBody = 'You have a new reminder!';
  let notificationOptions = {
    body: notificationBody,
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/icon-192.png',
    vibrate: [100, 50, 100],
    data: payload.data || {},
    tag: payload.data?.tag || undefined,
    requireInteraction: true // Keeps the notification until user interacts
  };

  // Prefer notification fields if present
  if (payload.notification) {
    notificationTitle = payload.notification.title || notificationTitle;
    notificationBody = payload.notification.body || notificationBody;
    notificationOptions.body = notificationBody;
    notificationOptions.icon = payload.notification.icon || notificationOptions.icon;
    notificationOptions.badge = payload.notification.badge || notificationOptions.badge;
  } else if (payload.data) {
    // Fallback to data fields if notification is missing
    notificationTitle = payload.data.title || notificationTitle;
    notificationBody = payload.data.body || notificationBody;
    notificationOptions.body = notificationBody;
    notificationOptions.icon = payload.data.icon || notificationOptions.icon;
    notificationOptions.badge = payload.data.badge || notificationOptions.badge;
  }

  // Add a line break between title and body for clarity (if supported)
  // Most browsers show title and body separately, but this ensures clarity
  notificationOptions.body = notificationBody;

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optionally handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
}); 