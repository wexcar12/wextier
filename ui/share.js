/**
 * @module ui/share
 * @description Шэринг ссылок.
 */
import { api } from '../api/firestore.js';
import { getDB } from '../api/firebase-init.js';
import { state } from '../core/state.js';
import { eventBus } from '../core/event-bus.js';

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return true;
    } catch { return false; }
  }
}

export async function shareTierlist() {
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.disabled = true;

  try {
    let url = null;

    if (!getDB()) {
      if (typeof LZString !== 'undefined') {
        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state.data1));
        url = location.origin + location.pathname + '?data=' + compressed;
      } else {
        eventBus.emit('toast:show', { text: 'Шэринг временно недоступен', type: 'error' });
        return;
      }
    } else {
      try {
        const docRef = await api.shareTierlist(state.data1);
        url = location.origin + location.pathname + '?id=' + docRef;
      } catch {
        if (typeof LZString !== 'undefined') {
          const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state.data1));
          url = location.origin + location.pathname + '?data=' + compressed;
        }
      }
    }

    if (url) {
      const ok = await copyToClipboard(url);
      eventBus.emit('toast:show', { text: ok ? 'Ссылка скопирована!' : 'Не удалось скопировать', type: ok ? 'success' : 'error' });
    } else {
      eventBus.emit('toast:show', { text: 'Не удалось создать ссылку', type: 'error' });
    }

    eventBus.emit('achievements:shared');
  } finally {
    if (shareBtn) shareBtn.disabled = false;
  }
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
      } else {
        eventBus.emit('toast:show', { text: 'Тир-лист по этой ссылке не найден', type: 'error' });
      }
    } catch (e) {
      eventBus.emit('toast:show', { text: 'Не удалось загрузить тир-лист по ссылке', type: 'error' });
    }
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
    } catch { /* ignore */ }
  }

  if (loaded) {
    history.replaceState({}, '', location.pathname);
  }

  return loaded;
}
