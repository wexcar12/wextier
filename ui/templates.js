/**
 * @module ui/templates
 */
import { eventBus } from '../core/event-bus.js';
import { state } from '../core/state.js';
import { renderAll } from './render.js';
import { modalManager } from './modal-manager.js';

const P = 'wt_';

function sg(k, f) { try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; } }
function ss(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }

const TEMPLATES = {
  music: [],
  movies: [
    { title: "Интерстеллар", img: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MvrIdxg1.jpg", link: "https://www.imdb.com/title/tt0816692/", svc: "imdb" },
    { title: "Начало", img: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", link: "https://www.imdb.com/title/tt1375666/", svc: "imdb" },
    { title: "Темный Рыцарь", img: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", link: "https://www.imdb.com/title/tt0468569/", svc: "imdb" },
    { title: "Матрица", img: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", link: "https://www.imdb.com/title/tt0133093/", svc: "imdb" },
    { title: "Бойцовский клуб", img: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", link: "https://www.imdb.com/title/tt0137523/", svc: "imdb" },
    { title: "Криминальное чтиво", img: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", link: "https://www.imdb.com/title/tt0110912/", svc: "imdb" }
  ],
  games: [
    { title: "The Witcher 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_184x69.jpg", link: "https://store.steampowered.com/app/292030/", svc: "steam" },
    { title: "Cyberpunk 2077", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1091500/", svc: "steam" }
  ],
  actors: [
    { title: "Ди Каприо", img: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg", link: "https://www.imdb.com/name/nm0000138/", svc: "imdb" },
    { title: "Киану Ривз", img: "https://image.tmdb.org/t/p/w500/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg", link: "https://www.imdb.com/name/nm0000206/", svc: "imdb" },
    { title: "Скарлетт Йоханссон", img: "https://image.tmdb.org/t/p/w500/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg", link: "https://www.imdb.com/name/nm0424060/", svc: "imdb" },
    { title: "Том Харди", img: "https://image.tmdb.org/t/p/w500/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg", link: "https://www.imdb.com/name/nm0362766/", svc: "imdb" },
    { title: "Марго Робби", img: "https://image.tmdb.org/t/p/w500/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg", link: "https://www.imdb.com/name/nm3053338/", svc: "imdb" },
    { title: "Роберт Дауни мл.", img: "https://image.tmdb.org/t/p/w500/5qHNjhtjMD4YWH3UP0rm4tKwxIQ.jpg", link: "https://www.imdb.com/name/nm0000375/", svc: "imdb" },
    { title: "Кристиан Бэйл", img: "https://image.tmdb.org/t/p/w500/b7fTC9WFkgqGOv77mLQpliWorsS.jpg", link: "https://www.imdb.com/name/nm0000288/", svc: "imdb" },
    { title: "Натали Портман", img: "https://image.tmdb.org/t/p/w500/vkoGFlFhRhUwaKIfecX1rT22L2O.jpg", link: "https://www.imdb.com/name/nm0000204/", svc: "imdb" },
    { title: "Брэд Питт", img: "https://image.tmdb.org/t/p/w500/cckcYc2v0yh1tc9QjRelptcOBko.jpg", link: "https://www.imdb.com/name/nm0000093/", svc: "imdb" },
    { title: "Джонни Депп", img: "https://image.tmdb.org/t/p/w500/yyB00XhPaPys7785Ff1UjK5wPaa.jpg", link: "https://www.imdb.com/name/nm0000136/", svc: "imdb" },
    { title: "Том Круз", img: "https://image.tmdb.org/t/p/w500/gThaIXgpCm3PCiXwFNDBJCme85y.jpg", link: "https://www.imdb.com/name/nm0000129/", svc: "imdb" },
    { title: "Мэттью Макконахи", img: "https://image.tmdb.org/t/p/w500/e9ZHRY5toiB6tgEQse5tn4SR804.jpg", link: "https://www.imdb.com/name/nm0000190/", svc: "imdb" },
    { title: "Энн Хэтэуэй", img: "https://image.tmdb.org/t/p/w500/tLelKoPNiyJC2311X2XG0eZzGqW.jpg", link: "https://www.imdb.com/name/nm0004266/", svc: "imdb" },
    { title: "Киллиан Мерфи", img: "https://image.tmdb.org/t/p/w500/3dz6bn88j2sFw7vYFmYj2wS0P8s.jpg", link: "https://www.imdb.com/name/nm0147068/", svc: "imdb" },
    { title: "Гэри Олдман", img: "https://image.tmdb.org/t/p/w500/2v9FVVBUrrkW2m3QOcYkuhq9A6o.jpg", link: "https://www.imdb.com/name/nm0000198/", svc: "imdb" },
    { title: "Райан Гослинг", img: "https://image.tmdb.org/t/p/w500/lyUyVARQEhce0A1K2u1Nksl8wMv.jpg", link: "https://www.imdb.com/name/nm0331516/", svc: "imdb" },
    { title: "Хит Леджер", img: "https://image.tmdb.org/t/p/w500/5Y9HnYYa9jF4NuYWQNFE4AeeO6E.jpg", link: "https://www.imdb.com/name/nm0005132/", svc: "imdb" },
    { title: "Анджелина Джоли", img: "https://image.tmdb.org/t/p/w500/wAjsYWwX79D0d90Z6aJtN1L8k8F.jpg", link: "https://www.imdb.com/name/nm0001401/", svc: "imdb" }
  ]
};

let currentPoolItems = [];

function pImg(svc) {
  const c = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00', steam: '#171a21', imdb: '#f5c518' };
  const i = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪', steam: '🎮', imdb: '🎬' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="${c[svc] || '#555'}" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">${i[svc] || '?'}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function updatePoolItems(type) {
  if (type === 'music') {
    currentPoolItems = [];
  } else {
    const currentItemsUrls = state.data1.flatMap(t => t.items.map(i => i.url));
    const userCustomItems = sg('custom_items_' + type, []);
    const fullTemplateList = (TEMPLATES[type] || []).concat(userCustomItems);
    currentPoolItems = fullTemplateList
      .filter(item => !currentItemsUrls.includes(item.link || item.url))
      .map(item => ({
        img: item.img || pImg(item.svc),
        url: item.link || item.url,
        svc: item.svc,
        title: item.title
      }));
  }
}

export function getPoolItems() { return currentPoolItems; }

function openCustomItemModal(type) {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold); margin-bottom: 20px;">Добавить свой элемент</h3>
    <input type="text" id="custom-title" placeholder="Название" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <input type="text" id="custom-url" placeholder="Ссылка" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text); margin-bottom:12px;" />
    <input type="text" id="custom-img" placeholder="Ссылка на картинку" autocomplete="off" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:10px; color:var(--text);" />
    <div style="margin: 16px 0; text-align: center;">
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">Превью:</p>
        <img id="custom-preview" src="${pImg(type === 'games' ? 'steam' : 'imdb')}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    </div>
    <div class="modal-actions" style="display:flex; justify-content:flex-end; gap:12px;">
      <button class="btn btn-secondary" id="custom-cancel">Отмена</button>
      <button class="btn btn-primary" id="custom-add">Добавить</button>
    </div>
  `;

  const close = modalManager.open(content);

  const imgInput = content.querySelector('#custom-img');
  const preview = content.querySelector('#custom-preview');
  imgInput.addEventListener('input', () => {
    preview.src = imgInput.value.trim() || pImg(type === 'games' ? 'steam' : 'imdb');
  });

  content.querySelector('#custom-cancel').onclick = close;
  content.querySelector('#custom-add').onclick = () => {
    const title = window.escapeHTML(content.querySelector('#custom-title').value.trim());
    const url = window.escapeHTML(content.querySelector('#custom-url').value.trim() || '#');
    const svcType = type === 'games' ? 'steam' : 'imdb';
    const img = window.escapeHTML(imgInput.value.trim()) || pImg(svcType);

    if (!title) { eventBus.emit('toast:show', { text: 'Введите название!', type: 'error' }); return; }

    const newItem = { title, img, url, svc: svcType };
    currentPoolItems.push(newItem);

    const customStorageKey = 'custom_items_' + type;
    const savedCustoms = sg(customStorageKey, []);
    savedCustoms.push(newItem);
    ss(customStorageKey, savedCustoms);
    
    eventBus.emit('templates:renderPool');
    close();
  };
}

export function renderTemplatePool() {
  const type = document.getElementById('templateSelect')?.value || 'music';
  const container = document.getElementById('templatePoolContainer');
  const pool = document.getElementById('templatePool');
  if (!container || !pool) return;

  if (type === 'music') {
    container.style.display = 'none';
  } else {
    container.style.display = 'flex';
    const sVal = document.getElementById('sizeSelect')?.value || '60';
    const styleSelect = document.getElementById('styleSelect');
    const styleClass = styleSelect ? styleSelect.value : 'gradient';

    const itemsHTML = currentPoolItems.map((item, idx) => {
      return `<div class="item style-${styleClass}" data-item-index="${idx}" title="${item.title}">
        <a href="${item.url}" target="_blank" rel="noopener">
        <img src="${item.img}" alt="${item.title}" style="width:${sVal}px; height:${sVal}px;">
        </a></div>`;
    }).join('');

    pool.innerHTML = itemsHTML + `<button id="addCustomPoolItemBtn" style="width:${sVal}px;height:${sVal}px;border:2px dashed var(--input-border);border-radius:12px;background:var(--input-bg);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;transition:0.2s;"><i data-lucide="plus"></i></button>`;

    const addBtn = document.getElementById('addCustomPoolItemBtn');
    if (addBtn) addBtn.onclick = () => openCustomItemModal(type);
    lucide.createIcons();
  }
}

eventBus.on('templates:changed', (type) => { updatePoolItems(type); renderTemplatePool(); });
eventBus.on('templates:renderPool', renderTemplatePool);
