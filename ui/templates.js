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
    { title: "Интерстеллар", img: "https://upload.wikimedia.org/wikipedia/ru/3/3a/Interstellar_2014.jpg", link: "https://www.imdb.com/title/tt0816692/", svc: "imdb" },
    { title: "Начало", img: "https://upload.wikimedia.org/wikipedia/ru/b/bc/Inception_poster.jpg", link: "https://www.imdb.com/title/tt1375666/", svc: "imdb" },
    { title: "Темный Рыцарь", img: "https://upload.wikimedia.org/wikipedia/ru/e/e3/The_Dark_Knight_2008.jpg", link: "https://www.imdb.com/title/tt0468569/", svc: "imdb" },
    { title: "Матрица", img: "https://upload.wikimedia.org/wikipedia/ru/5/52/The_Matrix_-_poster.jpg", link: "https://www.imdb.com/title/tt0133093/", svc: "imdb" },
    { title: "Бойцовский клуб", img: "https://upload.wikimedia.org/wikipedia/ru/5/51/Fight_Club.jpg", link: "https://www.imdb.com/title/tt0137523/", svc: "imdb" },
    { title: "Криминальное чтиво", img: "https://upload.wikimedia.org/wikipedia/ru/0/0a/Pulp_Fiction_1994.jpg", link: "https://www.imdb.com/title/tt0110912/", svc: "imdb" },
    { title: "Властелин Колец", img: "https://upload.wikimedia.org/wikipedia/ru/0/0a/The_Lord_of_the_Rings_-_The_Return_of_the_King.jpg", link: "https://www.imdb.com/title/tt0167260/", svc: "imdb" },
    { title: "Форрест Гамп", img: "https://upload.wikimedia.org/wikipedia/ru/6/62/Forrest_Gump.jpg", link: "https://www.imdb.com/title/tt0109830/", svc: "imdb" },
    { title: "Побег из Шоушенка", img: "https://upload.wikimedia.org/wikipedia/ru/d/de/The_Shawshank_Redemption.jpg", link: "https://www.imdb.com/title/tt0111161/", svc: "imdb" },
    { title: "Зеленая миля", img: "https://upload.wikimedia.org/wikipedia/ru/3/3b/The_Green_Mile.jpg", link: "https://www.imdb.com/title/tt0120689/", svc: "imdb" },
    { title: "Гладиатор", img: "https://upload.wikimedia.org/wikipedia/ru/8/8d/Gladiator_2000.jpg", link: "https://www.imdb.com/title/tt0172495/", svc: "imdb" },
    { title: "Титаник", img: "https://upload.wikimedia.org/wikipedia/ru/2/22/Titanic_poster.jpg", link: "https://www.imdb.com/title/tt0120338/", svc: "imdb" },
    { title: "Аватар", img: "https://upload.wikimedia.org/wikipedia/ru/1/1f/Avatar_2009.jpg", link: "https://www.imdb.com/title/tt0499549/", svc: "imdb" },
    { title: "Мстители: Финал", img: "https://upload.wikimedia.org/wikipedia/ru/4/4d/Avengers_Endgame.jpg", link: "https://www.imdb.com/title/tt4154796/", svc: "imdb" },
    { title: "Джокер", img: "https://upload.wikimedia.org/wikipedia/ru/6/6e/Joker_2019.jpg", link: "https://www.imdb.com/title/tt7286456/", svc: "imdb" },
    { title: "Назад в будущее", img: "https://upload.wikimedia.org/wikipedia/ru/9/9d/Back_to_the_Future.jpg", link: "https://www.imdb.com/title/tt0088763/", svc: "imdb" },
    { title: "Парк Юрского периода", img: "https://upload.wikimedia.org/wikipedia/ru/e/e7/Jurassic_Park.jpg", link: "https://www.imdb.com/title/tt0107290/", svc: "imdb" },
    { title: "Джанго освобожденный", img: "https://upload.wikimedia.org/wikipedia/ru/8/8b/Django_Unchained.jpg", link: "https://www.imdb.com/title/tt1853728/", svc: "imdb" },
    { title: "Волк с Уолл-стрит", img: "https://upload.wikimedia.org/wikipedia/ru/1/1f/The_Wolf_of_Wall_Street.jpg", link: "https://www.imdb.com/title/tt0993846/", svc: "imdb" },
    { title: "Дюна", img: "https://upload.wikimedia.org/wikipedia/ru/8/8e/Dune_2021.jpg", link: "https://www.imdb.com/title/tt1160419/", svc: "imdb" },
    { title: "Остров проклятых", img: "https://upload.wikimedia.org/wikipedia/ru/4/46/Shutter_Island.jpg", link: "https://www.imdb.com/title/tt1130884/", svc: "imdb" },
  ],
  games: [
    { title: "The Witcher 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_184x69.jpg", link: "https://store.steampowered.com/app/292030/", svc: "steam" },
    { title: "Cyberpunk 2077", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1091500/", svc: "steam" },
    { title: "Elden Ring", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1245620/", svc: "steam" },
    { title: "GTA V", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/capsule_184x69.jpg", link: "https://store.steampowered.com/app/271590/", svc: "steam" },
    { title: "RDR 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1174180/", svc: "steam" },
    { title: "CS 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_184x69.jpg", link: "https://store.steampowered.com/app/730/", svc: "steam" },
    { title: "Dota 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_184x69.jpg", link: "https://store.steampowered.com/app/570/", svc: "steam" },
    { title: "Baldur's Gate 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1086940/", svc: "steam" },
    { title: "Skyrim", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/capsule_184x69.jpg", link: "https://store.steampowered.com/app/489830/", svc: "steam" },
    { title: "Hollow Knight", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/capsule_184x69.jpg", link: "https://store.steampowered.com/app/367520/", svc: "steam" },
    { title: "Hades", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1145360/", svc: "steam" },
    { title: "Terraria", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/capsule_184x69.jpg", link: "https://store.steampowered.com/app/105600/", svc: "steam" },
    { title: "Stardew Valley", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/capsule_184x69.jpg", link: "https://store.steampowered.com/app/413150/", svc: "steam" },
    { title: "Portal 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/capsule_184x69.jpg", link: "https://store.steampowered.com/app/620/", svc: "steam" },
    { title: "DOOM Eternal", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/capsule_184x69.jpg", link: "https://store.steampowered.com/app/782330/", svc: "steam" },
    { title: "Subnautica", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/capsule_184x69.jpg", link: "https://store.steampowered.com/app/264710/", svc: "steam" }
  ],
  actors: [
    { title: "Ди Каприо", img: "https://upload.wikimedia.org/wikipedia/commons/2/25/Leonardo_DiCaprio_2014.jpg", link: "https://www.imdb.com/name/nm0000138/", svc: "imdb" },
    { title: "Киану Ривз", img: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Keanu_Reeves_%28crop_and_levels%29_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000206/", svc: "imdb" },
    { title: "Скарлетт Йоханссон", img: "https://upload.wikimedia.org/wikipedia/commons/6/60/Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0424060/", svc: "imdb" },
    { title: "Том Харди", img: "https://upload.wikimedia.org/wikipedia/commons/4/43/Tom_Hardy_by_Gage_Skidmore.jpg", link: "https://www.imdb.com/name/nm0362766/", svc: "imdb" },
    { title: "Марго Робби", img: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Margot_Robbie_by_Gage_Skidmore_2018.jpg", link: "https://www.imdb.com/name/nm3053338/", svc: "imdb" },
    { title: "Роберт Дауни мл.", img: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000375/", svc: "imdb" },
    { title: "Кристиан Бэйл", img: "https://upload.wikimedia.org/wikipedia/commons/7/73/Christian_Bale-2014.jpg", link: "https://www.imdb.com/name/nm0000288/", svc: "imdb" },
    { title: "Натали Портман", img: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Natalie_Portman_%2848470988352%29_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000204/", svc: "imdb" },
    { title: "Брэд Питт", img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg", link: "https://www.imdb.com/name/nm0000093/", svc: "imdb" },
    { title: "Джонни Депп", img: "https://upload.wikimedia.org/wikipedia/commons/2/21/Johnny_Depp_2020.jpg", link: "https://www.imdb.com/name/nm0000136/", svc: "imdb" },
    { title: "Том Круз", img: "https://upload.wikimedia.org/wikipedia/commons/3/33/Tom_Cruise_by_Gage_Skidmore_2.jpg", link: "https://www.imdb.com/name/nm0000129/", svc: "imdb" },
    { title: "Энн Хэтэуэй", img: "https://upload.wikimedia.org/wikipedia/commons/2/22/Anne_Hathaway_at_the_2007_Deauville_American_Film_Festival-01A.jpg", link: "https://www.imdb.com/name/nm0004266/", svc: "imdb" },
    { title: "Райан Гослинг", img: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Ryan_Gosling_in_2018.jpg", link: "https://www.imdb.com/name/nm0331516/", svc: "imdb" },
    { title: "Анджелина Джоли", img: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Angelina_Jolie_2_June_2014_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0001401/", svc: "imdb" },
    { title: "Уилл Смит", img: "https://upload.wikimedia.org/wikipedia/commons/3/3f/TechCrunch_Disrupt_2019_%2848834434641%29_%28cropped%29.jpg", link: "https://www.imdb.com/name/nm0000226/", svc: "imdb" },
    { title: "Том Хэнкс", img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Tom_Hanks_TIFF_2019.jpg", link: "https://www.imdb.com/name/nm0000158/", svc: "imdb" },
    { title: "Морган Фриман", img: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Morgan_Freeman_2017.jpg", link: "https://www.imdb.com/name/nm0000151/", svc: "imdb" },
    { title: "Харрисон Форд", img: "https://upload.wikimedia.org/wikipedia/commons/3/34/Harrison_Ford_by_Gage_Skidmore_3.jpg", link: "https://www.imdb.com/name/nm0000148/", svc: "imdb" }
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
        url: item.link || item.url || '#',
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
    const url = content.querySelector('#custom-url').value.trim() || '#';
    const svcType = type === 'games' ? 'steam' : 'imdb';
    const img = imgInput.value.trim() || pImg(svcType);

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
        <img loading="lazy" src="${item.img}" alt="${item.title}" 
             style="width:${sVal}px; height:${sVal}px;"
             onerror="this.src='${pImg(item.svc)}'">
        </a></div>`;
    }).join('');

    pool.innerHTML = itemsHTML + `<button id="addCustomPoolItemBtn" style="width:${sVal}px;height:${sVal}px;background:rgba(255,255,255,0.02);border:2px dashed rgba(255,255,255,0.15);border-radius:12px;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;transition:all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);"><i data-lucide="plus"></i></button>`;

    const addBtn = document.getElementById('addCustomPoolItemBtn');
    if (addBtn) {
        addBtn.onclick = () => openCustomItemModal(type);
        addBtn.onmouseover = () => { addBtn.style.borderColor = 'var(--gold)'; addBtn.style.color = 'var(--gold)'; };
        addBtn.onmouseout = () => { addBtn.style.borderColor = 'rgba(255,255,255,0.15)'; addBtn.style.color = 'var(--text-secondary)'; };
    }
    lucide.createIcons();
  }
}

eventBus.on('templates:changed', (type) => { updatePoolItems(type); renderTemplatePool(); });
eventBus.on('templates:renderPool', renderTemplatePool);
