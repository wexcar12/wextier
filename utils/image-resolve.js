// Сетевой слой поиска картинок. Вынесен из ui/templates.js (было ~220 строк внутри шаблонного
// модуля) — теперь его используют templates.js, community-templates.js и context-menu.js.
import { sg, ss } from './storage.js';
import { pImg } from './placeholder.js';

// Постер фильма/сериала по IMDb id — бесплатный CDN без ключа.
// Раньше был только ОДИН источник картинки (images.metahub.space). Если этот сервис
// временно недоступен/перегружен — постер просто не загружался, показывалась только
// цветная заглушка-иконка. Теперь у каждой картинки есть запасной "зеркальный" адрес,
// и если первый сервер не ответил — браузер сам попробует второй.
function imdbId(link) {
  const m = (link || '').match(/tt\d+/);
  return m ? m[0] : null;
}
export function imdbPoster(link) {
  const id = imdbId(link);
  return id ? `https://images.metahub.space/poster/small/${id}/img` : null;
}
export function imdbPosterMirror(link) {
  const id = imdbId(link);
  return id ? `https://live.metahub.space/poster/small/${id}/img` : null;
}

// Универсальный поиск картинки по тексту через серверную функцию (DuckDuckGo Images).
// ФИКС: раньше один 404 навсегда убивал авто-поиск до перезагрузки страницы. Теперь при
// сбое ставим временную блокировку на 10 минут — после неё запросы возобновляются сами.
let ddgBlockedUntil = 0;
function ddgAvailable() { return Date.now() >= ddgBlockedUntil; }
function blockDdg() { ddgBlockedUntil = Date.now() + 10 * 60 * 1000; }
export async function searchDuckDuckGo(query) {
  if (!ddgAvailable()) return null;
  if (!query || query.length < 2) return null;
  const cacheKey = 'ddg_img_' + query.toLowerCase();
  const cached = sg(cacheKey, null);
  if (cached) {
    if (typeof cached === 'object' && cached.url && cached.ts) {
      if (Date.now() - cached.ts < 7 * 24 * 60 * 60 * 1000) return cached.url;
    } else if (typeof cached === 'string') {
      return cached;
    }
  }
  try {
    const res = await fetch(`/api/image-search?q=${encodeURIComponent(query)}&n=12`);
    if (!res.ok) {
      if (res.status === 404) blockDdg();
      return null;
    }
    let data;
    try { data = await res.json(); } catch { blockDdg(); return null; }
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) return null;
    const validExts = /\.(jpg|jpeg|png|webp|gif)/i;
    for (const r of data.results) {
      const url = r.thumbnail || r.image;
      if (!url) continue;
      if (url.startsWith('data:')) continue;
      if (validExts.test(url) || url.includes('image') || url.includes('img') || url.includes('photo') || url.includes('poster') || url.includes('thumb')) {
        ss(cacheKey, { url, ts: Date.now() });
        return url;
      }
    }
    const fallback = data.results[0].thumbnail || data.results[0].image;
    if (fallback) {
      ss(cacheKey, { url: fallback, ts: Date.now() });
      return fallback;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function searchDuckDuckGoMulti(query, count = 6) {
  if (!ddgAvailable()) return [];
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`/api/image-search?q=${encodeURIComponent(query)}&n=${Math.min(count + 4, 20)}`);
    if (!res.ok) {
      if (res.status === 404) blockDdg();
      return [];
    }
    let data;
    try { data = await res.json(); } catch { blockDdg(); return []; }
    if (!data.results || !Array.isArray(data.results)) return [];
    const seen = new Set();
    const urls = [];
    for (const r of data.results) {
      const thumb = r.thumbnail || r.image;
      const full = r.image || r.thumbnail;
      if (!thumb || !full || thumb.startsWith('data:') || full.startsWith('data:')) continue;
      const key = full.split('?')[0];
      if (seen.has(key)) continue;
      seen.add(key);
      urls.push({ thumb, full });
      if (urls.length >= count) break;
    }
    return urls;
  } catch (e) {
    return [];
  }
}

// Поиск обложки через открытое Wikipedia API по НАЗВАНИЮ.
// Используется как третья, последняя попытка для фильмов/сериалов, если оба CDN-зеркала
// не ответили — а также для авто-поиска картинки, когда пользователь добавляет свой фильм.
export async function searchWikiThumbnail(title) {
  if (!title) return null;
  const cacheKey = 'wiki_thumb_' + title.toLowerCase();
  const cached = sg(cacheKey, null);
  if (cached) return cached;
  const hasCyrillic = /[а-яёА-ЯЁ]/.test(title);
  const langs = hasCyrillic ? ['ru', 'en'] : ['en', 'ru'];
  const queryWords = title.toLowerCase().replace(/[^a-zа-яёa-z0-9\s]/gi, '').split(/\s+/).filter(Boolean);
  for (const lang of langs) {
    try {
      const searchRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=3&namespace=0&format=json&origin=*`);
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const titles = searchData && searchData[1];
      if (!titles || !titles.length) continue;
      const bestTitle = titles.find(t => {
        const tw = t.toLowerCase().replace(/[^a-zа-яёa-z0-9\s]/gi, '').split(/\s+/).filter(Boolean);
        const overlap = queryWords.filter(w => tw.some(tw2 => tw2.includes(w) || w.includes(tw2))).length;
        return overlap >= Math.ceil(queryWords.length * 0.5);
      }) || null;
      if (!bestTitle) continue;
      const sumRes = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`);
      if (!sumRes.ok) continue;
      const sumData = await sumRes.json();
      const url = (sumData.thumbnail && sumData.thumbnail.source) ? sumData.thumbnail.source : null;
      if (url) { ss(cacheKey, url); return url; }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// Трёхступенчатый фолбэк для постера (imdb): основной CDN → зеркало →
// поиск по названию в Wikipedia → и только если совсем ничего не нашлось — заглушка.
// Экспортируется, чтобы этой же логикой пользовался ui/render.js для карточек,
// которые уже лежат в тир-листе (не только в пуле шаблонов).
export function attachPosterFallback(imgEl, item) {
  imgEl.addEventListener('error', async function handler() {
    const stage = this.dataset.stage || '0';
    if (stage === '0') {
      this.dataset.stage = '1';
      const mirror = imdbPosterMirror(item.url);
      if (mirror) { this.src = mirror; return; }
    }
    if (stage === '0' || stage === '1') {
      this.dataset.stage = '2';
      const ddgUrl = await searchDuckDuckGo(item.title + ' poster');
      if (ddgUrl) { this.src = ddgUrl; return; }
    }
    if (parseInt(this.dataset.stage) <= 2) {
      this.dataset.stage = '3';
      const wikiUrl = await searchWikiThumbnail(item.title);
      if (wikiUrl) { this.src = wikiUrl; return; }
    }
    this.removeEventListener('error', handler);
    this.onerror = null;
    this.src = pImg(item.svc);
  });
}

// Официальная обложка игры по appid из ссылки Steam — бесплатный CDN без ключа
export function steamHeader(link) {
  const m = (link || '').match(/\/app\/(\d+)/);
  return m ? `https://cdn.akamai.steamstatic.com/steam/apps/${m[1]}/header.jpg` : null;
}

// Фото актёра через открытое Wikipedia API (без ключа), с кэшем в localStorage.
// Раньше при неудаче (нет сети/Wikipedia не ответила) результат "нет фото" сохранялся
// в localStorage НАВСЕГДА — фото этого актёра переставало грузиться для пользователя
// навечно, даже если проблема была временной. Теперь кэшируем только УСПЕШНЫЙ результат,
// а неудачу всегда пробуем повторить при следующей загрузке.
export async function resolveActorPhoto(wikiSlug) {
  if (!wikiSlug) return null;
  const cacheKey = 'actor_photo_' + wikiSlug;
  const cached = sg(cacheKey, null);
  if (cached) return cached;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSlug)}`);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const url = (data.thumbnail && data.thumbnail.source) ? data.thumbnail.source : null;
    if (url) ss(cacheKey, url);
    return url;
  } catch (e) {
    return null;
  }
}

// Ищем игру в официальном публичном поиске Steam по названию (без ключа).
// Возвращает картинку обложки и ссылку на страницу игры, если что-то нашлось.
export async function searchSteamGame(title) {
  if (!title) return null;
  const cacheKey = 'steam_search_' + title.toLowerCase();
  const cached = sg(cacheKey, null);
  if (cached) return cached;
  try {
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=russian&cc=RU`);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const first = data.items && data.items[0];
    if (!first) return null;
    const result = { img: steamHeader('/app/' + first.id + '/'), url: 'https://store.steampowered.com/app/' + first.id + '/', title: first.name };
    ss(cacheKey, result);
    return result;
  } catch (e) {
    return null; // Скорее всего сеть/CORS — ничего страшного, останется ручной ввод
  }
}

// Общий авто-поиск картинки по названию (DuckDuckGo → Wikipedia). Один вызов вместо
// трёх почти одинаковых локальных реализаций в templates.js / community-templates.js /
// context-menu.js. С suffixes можно подсказать тип контента (poster, game cover и т.п.).
export async function findImageByTitle(title, suffixes = [' photo', ' фото', '']) {
  if (!title) return '';
  const words = title.split(/\s+/);
  for (let len = words.length; len >= Math.min(2, words.length); len--) {
    const q = words.slice(0, len).join(' ');
    for (const suffix of suffixes) {
      const res = await searchDuckDuckGo(q + suffix);
      if (res) return res;
    }
    const wiki = await searchWikiThumbnail(q);
    if (wiki) return wiki;
  }
  return '';
}
