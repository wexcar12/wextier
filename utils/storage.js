const P = 'wt_';
const CACHE_PREFIXES = ['ddg_img_', 'wiki_thumb_', 'actor_photo_', 'steam_search_'];

export function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}

export function ss(k, v) {
  const fullKey = P + k;
  const val = JSON.stringify(v);
  try {
    localStorage.setItem(fullKey, val);
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      evictCacheEntries();
      try { localStorage.setItem(fullKey, val); } catch (_) {}
    }
  }
}

function evictCacheEntries() {
  const cacheKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(P)) continue;
    const inner = key.slice(P.length);
    if (CACHE_PREFIXES.some(p => inner.startsWith(p))) {
      let ts = 0;
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        if (parsed && typeof parsed === 'object' && parsed.ts) ts = parsed.ts;
      } catch (_) {}
      cacheKeys.push({ key, ts, size: (localStorage.getItem(key) || '').length });
    }
  }
  cacheKeys.sort((a, b) => a.ts - b.ts);
  const removeCount = Math.max(Math.ceil(cacheKeys.length * 0.3), 10);
  for (let i = 0; i < Math.min(removeCount, cacheKeys.length); i++) {
    localStorage.removeItem(cacheKeys[i].key);
  }
}
