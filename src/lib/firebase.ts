import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from './supabase';

const firebaseConfig = {
  apiKey: "AIzaSyBrQ2zSKIDlyqZq2wA42XdkCfP8hTrkQFg",
  authDomain: "animedi-21cc8.firebaseapp.com",
  projectId: "animedi-21cc8",
  storageBucket: "animedi-21cc8.firebasestorage.app",
  messagingSenderId: "277484129751",
  appId: "1:277484129751:web:d85519aa323eb543714f92",
  measurementId: "G-WX5HGEQLWC"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export { getToken, onMessage };

const VAPID_KEY = 'BD1_g0II184P_UgzW-_MUVXX6aNpVerG9YOMpgn8Ir_Bq5TfOD9PvcweG-jPMogPJp1iSIwAc3rSE5wH1v-i5xg';

export async function requestAndSaveFcmToken(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Registered FCM service worker:', swReg);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    if (!token) return null;
    await supabase.from('user_push_tokens').upsert({ user_id: userId, token });
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
} 