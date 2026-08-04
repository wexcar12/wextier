/**
 * @module ui/templates
 * @description Шаблоны: 200 фильмов, 100 игр, 100 актёров.
 *              Игры — реальные картинки (Steam CDN).
 *              Фильмы и актёры — цветные SVG-заглушки (IMDb).
 */
import { eventBus } from '../core/event-bus.js';
import { state } from '../core/state.js';
import { modalManager } from './modal-manager.js';
import { escapeHTML, safeUrl, safeHref } from '../utils/sanitizers.js';
import { sg, ss } from '../utils/storage.js';
import { pImg } from '../utils/placeholder.js';
import { TEMPLATES } from '../data/templates-data.js';
import { imdbPoster, steamHeader, searchDuckDuckGoMulti, searchWikiThumbnail, attachPosterFallback, resolveActorPhoto, searchSteamGame } from '../utils/image-resolve.js';

let currentPoolItems = [];
let lastPoolFingerprint = '';
let lastPoolType = '';
let communityPoolActive = false;


// Догружает реальные фото актёров в уже отрисованный пул (плейсхолдер меняется на фото, когда оно готово).
// ФИКС: раньше запускались ВСЕ запросы к Wikipedia одновременно (до 100 штук разом на шаблон
// "Актёры") — публичный API часто отвечал не всем из-за одновременной нагрузки, и часть фото
// просто не подгружалась. Теперь запросы идут пачками по 6, это надёжнее.
async function hydrateActorPhotos() {
  const withWiki = currentPoolItems.map((item, idx) => ({ item, idx })).filter(x => x.item.wiki);
  const BATCH_SIZE = 6;
  for (let i = 0; i < withWiki.length; i += BATCH_SIZE) {
    const batch = withWiki.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async ({ item, idx }) => {
      const url = await resolveActorPhoto(item.wiki);
      if (!url) return;
      const imgEl = document.querySelector('#templatePool [data-item-index="' + idx + '"] img');
      if (imgEl) imgEl.src = url;
      item.img = url;
    }));
  }
}

export function updatePoolItems(type) {
  communityPoolActive = false;
  if (type === 'music') {
    currentPoolItems = [];
  } else {
    const currentItemsUrls = state.data1.flatMap(t => t.items.map(i => i.url));
    const userCustomItems = sg('custom_items_' + type, []);
    const fullTemplateList = (TEMPLATES[type] || []).concat(userCustomItems);
    currentPoolItems = fullTemplateList
      .filter(item => !currentItemsUrls.includes(item.link || item.url))
      .map(item => {
        let img = item.img || null;
        if (!img && item.svc === 'imdb') img = imdbPoster(item.link);
        if (!img && item.svc === 'steam') img = steamHeader(item.link);
        return {
          id: crypto.randomUUID(),
          img: img || pImg(item.svc),
          url: item.link || item.url || '#',
          svc: item.svc,
          title: item.title,
          wiki: item.wiki || null
        };
      });
  }
}

export function getPoolItems() { return currentPoolItems; }

// Добавление кастомного элемента в пул + сохранение в localStorage (custom_items_<type>).
// Общий путь и для модалки «свой элемент», и для загрузки картинок с диска.
function addCustomItem(type, title, img, url) {
  const newItem = { id: crypto.randomUUID(), title, img, url: url || '#', svc: type === 'games' ? 'steam' : 'imdb' };
  currentPoolItems.push(newItem);
  const customStorageKey = 'custom_items_' + type;
  const savedCustoms = sg(customStorageKey, []);
  savedCustoms.push(newItem);
  ss(customStorageKey, savedCustoms);
  eventBus.emit('templates:renderPool');
  return newItem;
}

// Принимает список файлов-картинок, читает их как dataURL и кладёт в пул.
// Файлы больше ~2 МБ в dataURL не помещаются в localStorage — сразу предупреждаем.
const MAX_FILE_BYTES = 2 * 1024 * 1024;

function addImageFilesToPool(type, files) {
  const imgFiles = Array.from(files || []).filter(f => f && f.type.startsWith('image/'));
  if (!imgFiles.length) return;
  let added = 0, pending = imgFiles.length;
  imgFiles.forEach(file => {
    if (file.size > MAX_FILE_BYTES) {
      eventBus.emit('toast:show', { text: `«${file.name}» слишком большой (${Math.round(file.size / 1024)} КБ) — максимум 2 МБ`, type: 'error' });
      if (--pending === 0 && added > 0) eventBus.emit('toast:show', { text: `Добавлено картинок: ${added}`, type: 'success' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Картинка';
      addCustomItem(type, title, e.target.result, '#');
      added++;
      if (--pending === 0) eventBus.emit('toast:show', { text: `Добавлено картинок: ${added}`, type: 'success' });
    };
    reader.onerror = () => {
      eventBus.emit('toast:show', { text: `Не удалось прочитать «${file.name}»`, type: 'error' });
      if (--pending === 0 && added > 0) eventBus.emit('toast:show', { text: `Добавлено картинок: ${added}`, type: 'success' });
    };
    reader.readAsDataURL(file);
  });
}

// Возврат карточек в пул (например, при удалении непустого тира), чтобы они не пропали.
// Дубликаты по url отсекаются — если карточка этого шаблона уже лежит в пуле, повторно
// не добавляем. Пул сразу перерисовывается.
export function returnItemsToPool(items) {
  if (!Array.isArray(items) || items.length === 0) return;
  const existingUrls = new Set(currentPoolItems.map(i => i.url));
  items.forEach(item => {
    if (item.url && item.url !== '#' && existingUrls.has(item.url)) return;
    if (item.url && item.url !== '#') existingUrls.add(item.url);
    currentPoolItems.push({
      id: crypto.randomUUID(),
      img: item.img || pImg(item.svc),
      url: item.url || '#',
      svc: item.svc,
      title: item.title || '',
      wiki: item.wiki || null
    });
  });
  renderTemplatePool();
}

// ФИКС 23: поиск внутри шаблона. ВАЖНО: элементы не удаляются и не переставляются —
// только скрываются через CSS (display:none), иначе собьются индексы у Sortable/drag&drop,
// которые опираются на порядок карточек в DOM.

function openCustomItemModal(type) {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold); margin-bottom: 20px;">Добавить свой элемент</h3>
    <input type="text" id="custom-title" placeholder="Название (мин. 3 символа для автопоиска)" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <input type="text" id="custom-url" placeholder="Ссылка" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <button class="btn btn-secondary" id="custom-find-img" style="width:100%;margin-bottom:12px;" type="button">Найти картинку по названию</button>
    <div id="image-picker-grid" class="image-picker-grid" style="display:none;"></div>
    <input type="text" id="custom-img" placeholder="Ссылка на картинку (можно вставить свою)" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text);" />
    <div id="custom-drop-zone" style="margin: 16px 0; text-align: center; border: 2px dashed transparent; border-radius: 14px; padding: 12px; transition: border-color 0.2s, background 0.2s; cursor:pointer;" title="Перетащите картинку сюда или нажмите Ctrl+V">
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">Превью (Ctrl+V или перетащите файл):</p>
        <img id="custom-preview" src="${pImg(type === 'games' ? 'steam' : 'imdb')}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    </div>
    <div class="modal-actions" style="display:flex; justify-content:flex-end; gap:12px;">
      <button class="btn btn-secondary" id="custom-cancel">Отмена</button>
      <button class="btn btn-primary" id="custom-add">Добавить</button>
    </div>
  `;

  const close = modalManager.open(content);
  const titleInput = content.querySelector('#custom-title');
  const urlInput = content.querySelector('#custom-url');
  const imgInput = content.querySelector('#custom-img');
  const preview = content.querySelector('#custom-preview');
  const findBtn = content.querySelector('#custom-find-img');
  const dropZone = content.querySelector('#custom-drop-zone');
  const pickerGrid = content.querySelector('#image-picker-grid');

  let autoFoundImage = false;
  let searchVersion = 0;

  function selectImage(url) {
    imgInput.value = url;
    preview.src = url;
    autoFoundImage = true;
    pickerGrid.querySelectorAll('.image-picker-item').forEach(el => {
      el.classList.toggle('active', el.dataset.url === url);
    });
  }

  function showPickerGrid(urls) {
    if (!urls || urls.length === 0) {
      pickerGrid.style.display = 'none';
      pickerGrid.innerHTML = '';
      return;
    }
    pickerGrid.style.display = 'flex';
    pickerGrid.innerHTML = '';
    urls.forEach(item => {
      const img = document.createElement('img');
      img.className = 'image-picker-item';
      img.src = item.thumb;
      img.dataset.url = item.full;
      img.alt = '';
      img.loading = 'lazy';
      img.onclick = () => selectImage(item.full);
      img.onerror = () => img.remove();
      pickerGrid.appendChild(img);
    });
  }

  imgInput.addEventListener('input', () => {
    autoFoundImage = false;
    preview.src = imgInput.value.trim() || pImg(type === 'games' ? 'steam' : 'imdb');
  });

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      imgInput.value = e.target.result;
      preview.src = e.target.result;
      autoFoundImage = false;
    };
    reader.readAsDataURL(file);
  }

  content.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        handleImageFile(item.getAsFile());
        return;
      }
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--gold)';
    dropZone.style.background = 'rgba(245, 197, 66, 0.05)';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'transparent';
    dropZone.style.background = '';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'transparent';
    dropZone.style.background = '';
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageFile(file);
  });

  function getSuffixes() {
    if (type === 'games') return [' game cover', ' game', ' обложка игры', ''];
    if (type === 'movies' || type === 'anime') return [' poster', ' постер', ' фильм', ''];
    return [' photo', ' фото', ''];
  }

  async function searchWithShortening(query, searchFn) {
    const words = query.split(/\s+/);
    for (let len = words.length; len >= Math.min(2, words.length); len--) {
      const shortened = words.slice(0, len).join(' ');
      const result = await searchFn(shortened);
      if (result) return result;
    }
    return null;
  }

  async function autoFindImage(showToastIfEmpty) {
    const title = titleInput.value.trim();
    if (!title) { if (showToastIfEmpty) eventBus.emit('toast:show', { text: 'Сначала введите название', type: 'info' }); return; }
    if (!showToastIfEmpty && title.length < 3) return;
    if (imgInput.value.trim() && !showToastIfEmpty && !autoFoundImage) return;

    const thisVersion = ++searchVersion;
    findBtn.disabled = true;
    findBtn.textContent = 'Ищу...';
    showPickerGrid([]);

    let wikiFound = await searchWithShortening(title, searchWikiThumbnail);
    if (thisVersion !== searchVersion) return;

    if (!wikiFound && type === 'games') {
      const game = await searchWithShortening(title, async (q) => {
        const g = await searchSteamGame(q);
        return g ? g : null;
      });
      if (thisVersion !== searchVersion) return;
      if (game) {
        wikiFound = game.img;
        if (!urlInput.value.trim()) urlInput.value = game.url;
      }
    }

    if (wikiFound) {
      imgInput.value = wikiFound;
      preview.src = wikiFound;
      autoFoundImage = true;
    }

    const suffixes = getSuffixes();
    let multiResults = [];
    const words = title.split(/\s+/);
    for (let len = words.length; len >= Math.min(2, words.length); len--) {
      const shortened = words.slice(0, len).join(' ');
      for (const suffix of suffixes) {
        if (thisVersion !== searchVersion) return;
        multiResults = await searchDuckDuckGoMulti(shortened + suffix, 6);
        if (multiResults.length > 0) break;
      }
      if (multiResults.length > 0) break;
    }
    if (thisVersion !== searchVersion) return;

    if (multiResults.length > 0) {
      showPickerGrid(multiResults);
      if (!wikiFound) {
        selectImage(multiResults[0].full);
      }
    } else if (!wikiFound) {
      if (showToastIfEmpty) {
        eventBus.emit('toast:show', { text: 'Не нашлось. Вставьте картинку вручную (Ctrl+V или перетащите файл).', type: 'error' });
      }
    }

    findBtn.disabled = false;
    findBtn.textContent = 'Найти картинку по названию';
  }

  findBtn.addEventListener('click', () => { imgInput.value = ''; autoFoundImage = false; autoFindImage(true); });

  let autoFindTimer = null;
  titleInput.addEventListener('input', () => {
    clearTimeout(autoFindTimer);
    autoFindTimer = setTimeout(() => autoFindImage(false), 600);
  });

  content.querySelector('#custom-cancel').onclick = close;
  content.querySelector('#custom-add').onclick = () => {
    const title = titleInput.value.trim();
    const url = urlInput.value.trim() || '#';
    const svcType = type === 'games' ? 'steam' : 'imdb';
    const img = imgInput.value.trim() || pImg(svcType);

    if (!title) { eventBus.emit('toast:show', { text: 'Введите название!', type: 'error' }); return; }
    if (url !== '#' && !/^https?:\/\//i.test(url)) { eventBus.emit('toast:show', { text: 'Некорректная ссылка', type: 'error' }); return; }

    addCustomItem(type, title, img, url);
    close();
  };
}

export function renderTemplatePool() {
  const type = document.getElementById('templateSelect')?.value || 'music';
  const container = document.getElementById('templatePoolContainer');
  const pool = document.getElementById('templatePool');
  if (!container || !pool) return;

  if (type === 'music' && !communityPoolActive) {
    container.style.display = 'flex';
    pool.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);width:100%;">Для музыки шаблон не предусмотрен — добавляйте треки вручную через кнопку <strong>+</strong> на тире или используйте «Добавить» в сайдбаре.</div>';
    lastPoolFingerprint = '';
    lastPoolType = 'music';
    return;
  }

  container.style.display = 'flex';

  const newFingerprint = type + '|' + currentPoolItems.map(i => i.id).join(';');
  if (newFingerprint === lastPoolFingerprint && lastPoolType === type) return;

  const typeChanged = lastPoolType !== type;
  lastPoolType = type;

  if (typeChanged || !pool.querySelector('.item')) {
    fullRenderPool(pool, type);
    lastPoolFingerprint = newFingerprint;
    return;
  }

  const existingItems = pool.querySelectorAll('.item');
  const existingIds = new Map();
  existingItems.forEach(el => existingIds.set(el.dataset.poolId || '', el));

  const newIds = new Set(currentPoolItems.map(i => i.id));

  existingIds.forEach((el, id) => {
    if (!id || !newIds.has(id)) el.remove();
  });

  const addBtn = document.getElementById('addCustomPoolItemBtn');
  currentPoolItems.forEach((item, idx) => {
    const existingEl = existingIds.get(item.id);
    if (existingEl) {
      existingEl.dataset.itemIndex = idx;
      existingEl.className = 'item';
    } else {
      const div = createPoolItemElement(item, idx);
      if (addBtn) pool.insertBefore(div, addBtn);
      else pool.appendChild(div);
      if (item.svc === 'imdb') {
        const img = div.querySelector('img');
        if (img) attachPosterFallback(img, item);
      }
    }
  });

  const emptyMsg = pool.querySelector('#pool-empty-msg');
  if (currentPoolItems.length === 0 && !emptyMsg) {
    const msg = document.createElement('div');
    msg.id = 'pool-empty-msg';
    msg.style.cssText = 'text-align:center;padding:16px;color:var(--text-secondary);width:100%;font-size:0.85rem;';
    msg.innerHTML = 'Все карточки разложены! Перетащите обратно из тира или добавьте свои через <strong>+</strong>';
    pool.insertBefore(msg, pool.firstChild);
  } else if (currentPoolItems.length > 0 && emptyMsg) {
    emptyMsg.remove();
  }

  lastPoolFingerprint = newFingerprint;
}

function createPoolItemElement(item, idx) {
  const div = document.createElement('div');
  div.className = 'item skeleton fade-in';
  div.dataset.itemIndex = idx;
  div.dataset.poolId = item.id;
  div.dataset.tooltip = item.title || '';
  const a = document.createElement('a');
  a.href = item.url || '#';
  a.target = '_blank';
  a.rel = 'noopener';
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.src = item.img;
  img.alt = escapeHTML(item.title || '');
  img.onload = function() { div.classList.remove('skeleton'); };
  if (item.svc !== 'imdb') {
    img.onerror = function() { this.onerror = null; this.src = pImg(item.svc); div.classList.remove('skeleton'); };
  } else {
    img.onerror = function() { div.classList.remove('skeleton'); };
  }
  a.appendChild(img);
  div.appendChild(a);
  return div;
}

function fullRenderPool(pool, type) {
  const emptyMsg = currentPoolItems.length === 0
    ? '<div id="pool-empty-msg" style="text-align:center;padding:16px;color:var(--text-secondary);width:100%;font-size:0.85rem;">Все карточки разложены! Перетащите обратно из тира или добавьте свои через <strong>+</strong></div>'
    : '';

  const itemsHTML = currentPoolItems.map((item, idx) => {
    const onerrorAttr = item.svc === 'imdb' ? `onerror="this.parentElement.parentElement.classList.remove('skeleton')"` : `onerror="this.onerror=null;this.src='${pImg(item.svc)}';this.parentElement.parentElement.classList.remove('skeleton')"`;
    const safeTitle = escapeHTML(item.title || '');
    const safeLink = safeHref(item.url || '#');
    const safeImg = safeUrl(item.img || '');
    return `<div class="item skeleton fade-in" data-item-index="${idx}" data-pool-id="${item.id}" data-tooltip="${safeTitle}" style="animation-delay:${Math.min(idx * 30, 600)}ms">
      <a href="${safeLink}" target="_blank" rel="noopener">
      <img loading="lazy" src="${safeImg}" alt="${safeTitle}"
           onload="this.parentElement.parentElement.classList.remove('skeleton')"
           ${onerrorAttr}>
      </a></div>`;
  }).join('');

  pool.innerHTML = emptyMsg + itemsHTML + `<button id="addCustomPoolItemBtn" title="Добавить свой элемент" style="width:var(--item-size, 60px);height:var(--item-size, 60px);background:rgba(255,255,255,0.02);border:2px dashed rgba(255,255,255,0.15);border-radius:12px;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;transition:all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg></button>` +
    `<button id="uploadPoolImgBtn" title="Загрузить картинки с устройства" style="width:var(--item-size, 60px);height:var(--item-size, 60px);background:rgba(255,255,255,0.02);border:2px dashed rgba(255,255,255,0.15);border-radius:12px;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg></button>` +
    `<input type="file" id="poolImgFileInput" accept="image/*" multiple style="display:none;">`;

  const addBtn = document.getElementById('addCustomPoolItemBtn');
  if (addBtn) {
    addBtn.onclick = () => openCustomItemModal(type);
    addBtn.onmouseover = () => { addBtn.style.borderColor = 'var(--gold)'; addBtn.style.color = 'var(--gold)'; };
    addBtn.onmouseout = () => { addBtn.style.borderColor = 'rgba(255,255,255,0.15)'; addBtn.style.color = 'var(--text-secondary)'; };
  }
  const uploadBtn = document.getElementById('uploadPoolImgBtn');
  const fileInput = document.getElementById('poolImgFileInput');
  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();
    uploadBtn.onmouseover = () => { uploadBtn.style.borderColor = 'var(--gold)'; uploadBtn.style.color = 'var(--gold)'; };
    uploadBtn.onmouseout = () => { uploadBtn.style.borderColor = 'rgba(255,255,255,0.15)'; uploadBtn.style.color = 'var(--text-secondary)'; };
    fileInput.onchange = function () { addImageFilesToPool(type, this.files); this.value = ''; };
  }
  if (currentPoolItems.some(i => i.wiki)) hydrateActorPhotos();
  if (type === 'movies' || type === 'anime') {
    currentPoolItems.forEach((item, idx) => {
      if (item.svc !== 'imdb') return;
      const imgEl = document.querySelector('#templatePool [data-item-index="' + idx + '"] img');
      if (imgEl) attachPosterFallback(imgEl, item);
    });
  }
}

eventBus.on('templates:changed', (type) => { updatePoolItems(type); renderTemplatePool(); });
eventBus.on('templates:renderPool', renderTemplatePool);

// Шаблоны сообщества: загрузка внешнего набора элементов в пул
eventBus.on('community:pool:set', (items) => {
  communityPoolActive = true;
  currentPoolItems = items.map(item => ({
    id: crypto.randomUUID(),
    img: item.img || pImg('imdb'),
    url: item.url || '#',
    svc: item.svc || 'imdb',
    title: item.title || '',
    wiki: null
  }));
  lastPoolFingerprint = '';
  lastPoolType = '__community__';
  renderTemplatePool();
});
