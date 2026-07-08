/**
 * @module api/firestore
 * @description Все операции с Firestore.
 */
import { getDB } from './firebase-init.js';

export const api = {
  async fetchTierlists(limit = 20, startAfterDoc = null) {
    const db = getDB();
    if (!db) return { items: [], lastCursor: null };

    try {
      let query = db.collection('tierlists')
        .where('visibility', '==', 'public')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (startAfterDoc) query = query.startAfter(startAfterDoc);

      const snap = await query.get();
      const items = [];
      snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      const lastCursor = snap.docs[snap.docs.length - 1] || null;

      return { items, lastCursor };
    } catch (e) {
      console.error('fetchTierlists failed:', e);
      return { items: [], lastCursor: null };
    }
  },

  async fetchTopTierlists(limit = 20) {
    const db = getDB();
    if (!db) return [];

    try {
      const snap = await db.collection('tierlists')
        .where('visibility', '==', 'public')
        .orderBy('wins', 'desc')
        .limit(limit)
        .get();

      const items = [];
      snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      return items;
    } catch (e) {
      console.error('fetchTopTierlists failed:', e);
      return [];
    }
  },

  async publishTierlist(data) {
    const db = getDB();
    if (!db) throw new Error('Firebase not available');

    const docRef = await db.collection('tierlists').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  async shareTierlist(data) {
    const db = getDB();
    if (!db) throw new Error('Firebase not available');

    const docRef = await db.collection('shared').add({
      data: JSON.stringify(data),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  async loadSharedTierlist(id) {
    const db = getDB();
    if (!db) return null;

    const doc = await db.collection('shared').doc(id).get();
    return doc.exists ? JSON.parse(doc.data().data) : null;
  },

  async loadTierlist(id) {
    const db = getDB();
    if (!db) return null;

    const doc = await db.collection('tierlists').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async voteFor(tierlistId) {
    const db = getDB();
    if (!db) throw new Error('Firebase not available');

    const ref = db.collection('tierlists').doc(tierlistId);
    const doc = await ref.get();
    if (!doc.exists) return 0;

    const currentWins = doc.data().wins || 0;
    await ref.update({ wins: currentWins + 1 });
    return currentWins + 1;
  },

  async fetchUserLists(userId) {
    const db = getDB();
    if (!db) return [];

    const snap = await db.collection('tierlists')
      .where('authorId', '==', userId)
      .get();

    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    return items;
  },

  async loadComments(tierlistId) {
    const db = getDB();
    if (!db) return [];

    const snap = await db.collection('tierlists')
      .doc(tierlistId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .get();

    const comments = [];
    snap.forEach(doc => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
  },

  async addComment(tierlistId, text) {
    const db = getDB();
    if (!db) throw new Error('Firebase not available');

    await db.collection('tierlists')
      .doc(tierlistId)
      .collection('comments')
      .add({
        text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
  }
};