/**
 * @module api/firestore
 * @description Все операции с Firestore.
 */
import { getDB } from './firebase-init.js';

export const api = {
  // Лайки тир-листов в галерее — атомарный increment.
  // Используем существующее поле likesCount (число), а не likes (это отдельный массив).
  async likeTierlist(tierlistId) {
    const db = getDB();
    if (!db) return 0;
    let likedIds;
    try { likedIds = new Set(JSON.parse(localStorage.getItem('wt_liked_lists') || '[]')); } catch { likedIds = new Set(); }
    if (likedIds.has(tierlistId)) return 0;
    const lastLike = parseInt(localStorage.getItem('wt_last_like') || '0', 10);
    if (Date.now() - lastLike < 5000) return 0;
    localStorage.setItem('wt_last_like', String(Date.now()));
    const ref = db.collection('tierlists').doc(tierlistId);
    await ref.update({ likesCount: firebase.firestore.FieldValue.increment(1) });
    const doc = await ref.get();
    return doc.exists ? (doc.data().likesCount || 0) : 0;
  },

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
        .orderBy('likesCount', 'desc')
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

    const allowed = { name: data.name, templateType: data.templateType, data: data.data, trackCount: data.trackCount, wins: data.wins || 0, likes: data.likes || [], likesCount: data.likesCount || 0, visibility: data.visibility || 'public', authorId: data.authorId, authorName: data.authorName };
    const docRef = await db.collection('tierlists').add({
      ...allowed,
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
    if (!doc.exists) return null;
    try { return JSON.parse(doc.data().data); } catch { return null; }
  },

  async loadTierlist(id) {
    const db = getDB();
    if (!db) return null;

    const doc = await db.collection('tierlists').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async fetchUserLists(userId) {
    const db = getDB();
    if (!db) return [];

    const snap = await db.collection('tierlists')
      .where('authorId', '==', userId)
      .limit(50)
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

  async addComment(tierlistId, text, parentId = null, user = null) {
    const db = getDB();
    if (!db) throw new Error('Firebase not available');

    const safeText = (text || '').slice(0, 2000);
    const payload = {
      text: safeText,
      authorName: user ? user.name : 'Аноним',
      authorId: user ? user.uid : null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (parentId) payload.parentId = parentId;

    await db.collection('tierlists')
      .doc(tierlistId)
      .collection('comments')
      .add(payload);
  },

  // --- Community Templates ---

  async publishTemplate(data) {
    const db = getDB();
    if (!db) throw new Error('Firebase not available');
    const docRef = await db.collection('community_templates').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  async fetchCommunityTemplates(includeAdult = false) {
    const db = getDB();
    if (!db) return [];
    try {
      let query = db.collection('community_templates');
      if (!includeAdult) query = query.where('isAdult', '==', false);
      query = query.orderBy('createdAt', 'desc').limit(50);
      const snap = await query.get();
      const items = [];
      snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      return items;
    } catch (e) {
      console.error('fetchCommunityTemplates failed:', e);
      return [];
    }
  },

  async loadCommunityTemplate(id) {
    const db = getDB();
    if (!db) return null;
    const doc = await db.collection('community_templates').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }
};