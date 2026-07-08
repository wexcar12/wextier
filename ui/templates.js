/**
 * @module ui/templates
 * @description Шаблоны (movies, games, actors) + кастомные элементы.
 */
import { eventBus } from '../core/event-bus.js';
import { state } from '../core/state.js';
import { renderAll } from './render.js';

const P = 'wt_';

function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}
function ss(k, v) {
  try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
}

const TEMPLATES = {
  music: [],
  movies: [
    { title: "Интерстеллар", img: "https://st.kp.yandex.net/images/film_big/258687.jpg", link: "https://www.imdb.com/title/tt0816692/", svc: "imdb" },
    { title: "Начало", img: "https://st.kp.yandex.net/images/film_big/447301.jpg", link: "https://www.imdb.com/title/tt1375666/", svc: "imdb" },
    { title: "Темный Рыцарь", img: "https://st.kp.yandex.net/images/film_big/111543.jpg", link: "https://www.imdb.com/title/tt0468569/", svc: "imdb" },
    { title: "Матрица", img: "https://st.kp.yandex.net/images/film_big/301.jpg", link: "https://www.imdb.com/title/tt0133093/", svc: "imdb" },
    { title: "Бойцовский клуб", img: "https://st.kp.yandex.net/images/film_big/361.jpg", link: "https://www.imdb.com/title/tt0137523/", svc: "imdb" },
    { title: "Криминальное чтиво", img: "https://st.kp.yandex.net/images/film_big/342.jpg", link: "https://www.imdb.com/title/tt0110912/", svc: "imdb" },
    { title: "Форрест Гамп", img: "https://st.kp.yandex.net/images/film_big/448.jpg", link: "https://www.imdb.com/title/tt0109830/", svc: "imdb" },
    { title: "Гладиатор", img: "https://st.kp.yandex.net/images/film_big/474.jpg", link: "https://www.imdb.com/title/tt0172495/", svc: "imdb" },
    { title: "Зеленая миля", img: "https://st.kp.yandex.net/images/film_big/435.jpg", link: "https://www.imdb.com/title/tt0114709/", svc: "imdb" },
    { title: "Властелин Колец", img: "https://st.kp.yandex.net/images/film_big/312.jpg", link: "https://www.imdb.com/title/tt0120737/", svc: "imdb" },
    { title: "Побег из Шоушенка", img: "https://st.kp.yandex.net/images/film_big/324.jpg", link: "https://www.imdb.com/title/tt0111161/", svc: "imdb" },
    { title: "Крестный отец", img: "https://st.kp.yandex.net/images/film_big/325.jpg", link: "https://www.imdb.com/title/tt0068646/", svc: "imdb" },
    { title: "Шрэк", img: "https://st.kp.yandex.net/images/film_big/430.jpg", link: "https://www.imdb.com/title/tt0126029/", svc: "imdb" },
    { title: "Пираты Карибского моря", img: "https://st.kp.yandex.net/images/film_big/4365.jpg", link: "https://www.imdb.com/title/tt0325980/", svc: "imdb" },
    { title: "Аватар", img: "https://st.kp.yandex.net/images/film_big/251733.jpg", link: "https://www.imdb.com/title/tt0499549/", svc: "imdb" },
    { title: "Остров проклятых", img: "https://st.kp.yandex.net/images/film_big/397667.jpg", link: "https://www.imdb.com/title/tt1130884/", svc: "imdb" },
    { title: "1+1", img: "https://st.kp.yandex.net/images/film_big/535341.jpg", link: "https://www.imdb.com/title/tt1675434/", svc: "imdb" },
    { title: "Джентльмены", img: "https://st.kp.yandex.net/images/film_big/1143242.jpg", link: "https://www.imdb.com/title/tt8131016/", svc: "imdb" },
    { title: "Престиж", img: "https://st.kp.yandex.net/images/film_big/195334.jpg", link: "https://www.imdb.com/title/tt0482571/", svc: "imdb" },
    { title: "Волк с Уолл-стрит", img: "https://st.kp.yandex.net/images/film_big/462682.jpg", link: "https://www.imdb.com/title/tt0993846/", svc: "imdb" }
  ],
  games: [
    { title: "The Witcher 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_184x69.jpg", link: "https://store.steampowered.com/app/292030/", svc: "steam" },
    { title: "Cyberpunk 2077", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1091500/", svc: "steam" },
    { title: "Elden Ring", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1245620/", svc: "steam" },
    { title: "RDR 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1174180/", svc: "steam" },
    { title: "GTA V", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/capsule_184x69.jpg", link: "https://store.steampowered.com/app/271590/", svc: "steam" },
    { title: "Minecraft", img: "https://static-cdn.jtvnw.net/ttv-boxart/27471_IGDB-144x192.jpg", link: "https://www.minecraft.net/", svc: "steam" },
    { title: "CS 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_184x69.jpg", link: "https://store.steampowered.com/app/730/", svc: "steam" },
    { title: "Dota 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_184x69.jpg", link: "https://store.steampowered.com/app/570/", svc: "steam" },
    { title: "Portal 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/capsule_184x69.jpg", link: "https://store.steampowered.com/app/620/", svc: "steam" },
    { title: "Baldur's Gate 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1086940/", svc: "steam" },
    { title: "Skyrim", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/capsule_184x69.jpg", link: "https://store.steampowered.com/app/489830/", svc: "steam" },
    { title: "Terraria", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/capsule_184x69.jpg", link: "https://store.steampowered.com/app/105600/", svc: "steam" },
    { title: "Half-Life 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220/capsule_184x69.jpg", link: "https://store.steampowered.com/app/220/", svc: "steam" },
    { title: "Doom Eternal", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/capsule_184x69.jpg", link: "https://store.steampowered.com/app/782330/", svc: "steam" },
    { title: "Fallout 4", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/capsule_184x69.jpg", link: "https://store.steampowered.com/app/377160/", svc: "steam" },
    { title: "Hades", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/capsule_184x69.jpg", link: "https://store.steampowered.com/app/1145360/", svc: "steam" },
    { title: "Stardew Valley", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/capsule_184x69.jpg", link: "https://store.steampowered.com/app/413150/", svc: "steam" },
    { title: "Left 4 Dead 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/550/capsule_184x69.jpg", link: "https://store.steampowered.com/app/550/", svc: "steam" },
    { title: "Rust", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/capsule_184x69.jpg", link: "https://store.steampowered.com/app/252490/", svc: "steam" },
    { title: "Subnautica", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/capsule_184x69.jpg", link: "https://store.steampowered.com/app/264710/", svc: "steam" }
  ],
  actors: [
    { title: "Ди Каприо", img: "https://st.kp.yandex.net/images/actor_big/37859.jpg", link: "https://www.imdb.com/name/nm0000138/", svc: "imdb" },
    { title: "Киану Ривз", img: "https://st.kp.yandex.net/images/actor_big/7836.jpg", link: "https://www.imdb.com/name/nm0000206/", svc: "imdb" },
    { title: "Скарлетт Йоханссон", img: "https://st.kp.yandex.net/images/actor_big/33113.jpg", link: "https://www.imdb.com/name/nm0424060/", svc: "imdb" },
    { title: "Том Харди", img: "https://st.kp.yandex.net/images/actor_big/40781.jpg", link: "https://www.imdb.com/name/nm0362766/", svc: "imdb" },
    { title: "Марго Робби", img: "https://st.kp.yandex.net/images/actor_big/1614214.jpg", link: "https://www.imdb.com/name/nm3053338/", svc: "imdb" },
    { title: "Роберт Дауни мл.", img: "https://st.kp.yandex.net/images/actor_big/10096.jpg", link: "https://www.imdb.com/name/nm0000375/", svc: "imdb" },
    { title: "Кристиан Бэйл", img: "https://st.kp.yandex.net/images/actor_big/8786.jpg", link: "https://www.imdb.com/name/nm0000288/", svc: "imdb" },
    { title: "Натали Портман", img: "https://st.kp.yandex.net/images/actor_big/529.jpg", link: "https://www.imdb.com/name/nm0000204/", svc: "imdb" },
    { title: "Брэд Питт", img: "https://st.kp.yandex.net/images/actor_big/25584.jpg", link: "https://www.imdb.com/name/nm0000093/", svc: "imdb" },
    { title: "Джонни Депп", img: "https://st.kp.yandex.net/images/actor_big/6245.jpg", link: "https://www.imdb.com/name/nm0000136/", svc: "imdb" },
    { title: "Том Круз", img: "https://st.kp.yandex.net/images/actor_big/7987.jpg", link: "https://www.imdb.com/name/nm0000129/", svc: "imdb" },
    { title: "Мэттью Макконахи", img: "https://st.kp.yandex.net/images/actor_big/9230.jpg", link: "https://www.imdb.com/name/nm0000190/", svc: "imdb" },
    { title: "Энн Хэтэуэй", img: "https://st.kp.yandex.net/images/actor_big/38383.jpg", link: "https://www.imdb.com/name/nm0004266/", svc: "imdb" },
    { title: "Киллиан Мерфи", img: "https://st.kp.yandex.net/images/actor_big/24255.jpg", link: "https://www.imdb.com/name/nm0147068/", svc: "imdb" },
    { title: "Гэри Олдман", img: "https://st.kp.yandex.net/images/actor_big/8423.jpg", link: "https://www.imdb.com/name/nm0000198/", svc: "imdb" },
    { title: "Райан Гослинг", img: "https://st.kp.yandex.net/images/actor_big/31038.jpg", link: "https://www.imdb.com/name/nm0331516/", svc: "imdb" },
    { title: "Хит Леджер", img: "https://st.kp.yandex.net/images/actor_big/4374.jpg", link: "https://www.imdb.com/name/nm0005132/", svc: "imdb" },
    { title: "Анджелина Джоли", img: "https://st.kp.yandex.net/images/actor_big/12444.jpg", link: "https://www.imdb.com/name/nm0001401/", svc: "imdb" },
    { title: "Аль Пачино", img: "https://st.kp.yandex.net/images/actor_big/5801.jpg", link: "https://www.imdb.com/name/nm0000199/", svc: "imdb" },
    { title: "Уилл Смит", img: "https://st.kp.yandex.net/images/actor_big/4703.jpg", link: "https://www.imdb.com/name/nm0005450/", svc: "imdb" }
  ]
};

let currentPoolItems = [];

function pImg(svc) {
  const c = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00', steam: '#171a21', imdb: '#f5c518' };
  const i = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪', steam: '🎮', imdb: '🎬' };
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="' + (c[svc] || '#555') + '" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">' + (i[svc] || '?') + '</text></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function updatePoolItems(type) {
  if (type === 'music') {
    currentPoolItems = [];
  } else {
    const currentItemsUrls = state.data1.flatMap(t => t.items.map(i => i.url));
    const customStorageKey = 'custom_items_' + type;
    const userCustomItems = sg(customStorageKey, []);
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

export function renderTemplatePool() {
  const type = document.getElementById('templateSelect')?.value || 'music';
  const container = document.getElementById('templatePoolContainer');
  const pool = document.getElementById('templatePool');

  if (!container || !pool) return;

  if (type === 'music') {
    container.style.display = 'none';
  } else {
    container.style.display = 'flex';
    const itemsHTML = currentPoolItems.map((item, idx) => {
      return '<div class="item" data-item-index="' + idx + '">' +
        '<a href="' + item.url + '" target="_blank" rel="noopener" title="' + (item.title || '') + '">' +
        '<img src="' + item.img + '" alt="' + (item.title || '') + '">' +
        '</a></div>';
    }).join('');

    const sVal = document.getElementById('sizeSelect')?.value || '60';
    pool.innerHTML = itemsHTML + '<button id="addCustomPoolItemBtn" style="width:' + sVal + 'px;height:' + sVal + 'px;border:2px dashed rgba(255,255,255,0.2);border-radius:10px;background:rgba(255,255,255,0.03);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;"><i data-lucide="plus"></i></button>';

    const addBtn = document.getElementById('addCustomPoolItemBtn');
    if (addBtn) {
      addBtn.onclick = () => {
        const title = prompt('Введите название:');
        if (!title || !title.trim()) return;
        const url = prompt('Введите ссылку:', 'https://');
        if (!url || !url.trim()) return;
        const img = prompt('Введите ссылку на картинку (или оставьте пустой):');
        const svcType = type === 'games' ? 'steam' : 'imdb';
        const finalImg = (img && img.trim()) ? img.trim() : pImg(svcType);
        const newItem = { title: title.trim(), img: finalImg, url: url.trim(), svc: svcType };
        currentPoolItems.push(newItem);

        const customStorageKey = 'custom_items_' + type;
        const savedCustoms = sg(customStorageKey, []);
        savedCustoms.push(newItem);
        ss(customStorageKey, savedCustoms);
        renderAll();
        eventBus.emit('templates:renderPool');
      };
    }
  }
}

eventBus.on('templates:changed', (type) => {
  updatePoolItems(type);
  renderTemplatePool();
});

eventBus.on('templates:renderPool', () => {
  renderTemplatePool();
});