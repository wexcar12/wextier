/**
 * @module api/auth
 * @description Google-авторизация.
 */
import { getAuth } from './firebase-init.js';
import { eventBus } from '../core/event-bus.js';

let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function initAuthObserver() {
  const auth = getAuth();
  if (!auth) return;

  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = {
        uid: user.uid,
        name: user.displayName,
        photo: user.photoURL
      };
    } else {
      currentUser = null;
    }
    eventBus.emit('auth:changed', currentUser);
  });
}

export async function loginWithGoogle() {
  const auth = getAuth();
  if (!auth) throw new Error('Auth not available');

  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  return result.user;
}

export async function logout() {
  const auth = getAuth();
  if (!auth) return;
  await auth.signOut();
}