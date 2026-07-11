/**
 * @module ui/share
 * @description Шэринг ссылок.
 */
import { api } from '../api/firestore.js';
import { getDB } from '../api/firebase-init.js';
import { state } from '../core/state.js';
import { eventBus } from '../core/event-bus.js';

export async function shareTierlist() {
  if (!getDB()) {
    // Оффлайн-шэринг через LZString
    if (typeof LZString !== 'undefined') {
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state.data1));
      const url = location.origin + location.pathname + '?data=' + compressed;
      navigator.clipboard.writeText(url).then(() => {
        eventBus.emit('toast:show', { text: 'Ссылка скопирована!', type: 'success' });
      });
    }
    return;
  }

  try {
    const docRef = await api.shareTierlist(state.data1);
    const shortUrl = location.origin + location.pathname + '?id=' + docRef;
    navigator.clipboard.writeText(shortUrl).then(() => {
      eventBus.emit('toast:show', { text: 'Ссылка скопирована!', type: 'success' });
    });
  } catch (e) {
    // Fallback to LZString
    if (typeof LZString !== 'undefined') {
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state.data1));
      const url = location.origin + location.pathname + '?data=' + compressed;
      navigator.clipboard.writeText(url).then(() => {
        eventBus.emit('toast:show', { text: 'Ссылка скопирована!', type: 'success' });
      });
    }
  }

  // Достижение
  eventBus.emit('achievements:shared');
}

export async function loadFromURL() {
  const p = new URLSearchParams(location.search);
  let loaded = false;

  if (p.has('id') && getDB()) {
    try {
      const data = await api.loadSharedTierlist(p.get('id'));
      if (data && Array.isArray(data)) {
        state.setData(data, 1);
        loaded = true;
      }
    } catch (e) { /* fallback */ }
  }

  if (!loaded && p.has('data')) {
    try {
      if (typeof LZString !== 'undefined') {
        const d = JSON.parse(LZString.decompressFromEncodedURIComponent(p.get('data')));
        if (Array.isArray(d)) {
          state.setData(d, 1);
          loaded = true;
        }
      }
    } catch (e) { /* ignore */ }
  }

  if (loaded) {
    history.replaceState({}, '', location.pathname);
  }

  return loaded;
}