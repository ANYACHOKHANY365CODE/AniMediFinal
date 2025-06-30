const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// TODO: Replace with your actual FCM token from Supabase
const token = 'c1op1hGmYPhJbAhR9VGjmy:APA91bE_ZrkCZRh0zsXQpUc5hxInU3ohe09G3fJWNaY6sDtErfy_JtDMk1x6A9Qd1JxRiSD8jFoE3XfImDfpsNzY5kCSHZ5hcFu3vNucNg1ydtHstgNQqyA';

admin.messaging().send({
  token,
  notification: {
    title: 'AniMedi Test',
    body: 'This is a direct FCM test notification!',
  },
}).then(response => {
  console.log('Successfully sent message:', response);
}).catch(error => {
  console.error('Error sending message:', error);
}); 