/**
 * @module api/firebase-init
 * @description Инициализация Firebase. Конфиг уже здесь.
 */

const firebaseConfig = {
  apiKey: "AIzaSyDIiUmEqdmQXyhQfUh3Zv-oiA62qXunOqs",
  authDomain: "wex-tier.firebaseapp.com",
  projectId: "wex-tier",
  storageBucket: "wex-tier.appspot.com",
  messagingSenderId: "81848663409",
  appId: "1:81848663409:web:4a450cd1960ed71db64ad0"
};

let db = null;
let auth = null;

export function initFB() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    auth = firebase.auth();
    return true;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    db = null;
    auth = null;
    return false;
  }
}

export function getDB() { return db; }
export function getAuth() { return auth; }