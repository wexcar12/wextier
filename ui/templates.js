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

// ФИКС 6: Огромная база элементов
const TEMPLATES = {
  music: [],
  movies: [
    { title: "Интерстеллар", img: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MvrIdxg1.jpg", svc: "imdb" },
    { title: "Начало", img: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", svc: "imdb" },
    { title: "Темный Рыцарь", img: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", svc: "imdb" },
    { title: "Матрица", img: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", svc: "imdb" },
    { title: "Бойцовский клуб", img: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", svc: "imdb" },
    { title: "Криминальное чтиво", img: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", svc: "imdb" },
    { title: "Властелин Колец: Возвращение Короля", img: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", svc: "imdb" },
    { title: "Форрест Гамп", img: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", svc: "imdb" },
    { title: "Побег из Шоушенка", img: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", svc: "imdb" },
    { title: "Зеленая миля", img: "https://image.tmdb.org/t/p/w500/8VG8fDNiy50H4FedGwdSVUPoaJe.jpg", svc: "imdb" },
    { title: "Гладиатор", img: "https://image.tmdb.org/t/p/w500/ty8TGRWGIl0QQzYQAHD00aAmskO.jpg", svc: "imdb" },
    { title: "Титаник", img: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", svc: "imdb" },
    { title: "Аватар", img: "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", svc: "imdb" },
    { title: "Мстители: Финал", img: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", svc: "imdb" },
    { title: "Джокер", img: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", svc: "imdb" },
    { title: "Звездные войны: Империя наносит ответный удар", img: "https://image.tmdb.org/t/p/w500/7BuH8itoSrLExs2GIrFNRoPhtM7.jpg", svc: "imdb" },
    { title: "Назад в будущее", img: "https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sA84clyzjI.jpg", svc: "imdb" },
    { title: "Гарри Поттер и Философский камень", img: "https://image.tmdb.org/t/p/w500/wuMc08IPKEb01yOVe28B7U3j9bF.jpg", svc: "imdb" },
    { title: "Парк Юрского периода", img: "https://image.tmdb.org/t/p/w500/b1xJwUwvrO0T4X4a4hQ0Xj4yWqM.jpg", svc: "imdb" },
    { title: "Терминатор 2: Судный день", img: "https://image.tmdb.org/t/p/w500/weHEh8lV6UfOQ7jV5sO0H3O7sNn.jpg", svc: "imdb" },
    { title: "Чужой", img: "https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v4Rzk1KIl0M0rR.jpg", svc: "imdb" },
    { title: "Джанго освобожденный", img: "https://image.tmdb.org/t/p/w500/7aLzQpE0eZ3BXXT5mG1W0zM9zVp.jpg", svc: "imdb" },
    { title: "Бесславные ублюдки", img: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", svc: "imdb" }, // Reusing DK image just for example if needed, better unique:
    { title: "Волк с Уолл-стрит", img: "https://image.tmdb.org/t/p/w500/sKcrF1aTc1B0qR4T0Z1bQ7XQ7Vn.jpg", svc: "imdb" },
    { title: "Бегущий по лезвию 2049", img: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", svc: "imdb" },
    { title: "Человек-паук: Через вселенные", img: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", svc: "imdb" },
    { title: "Дюна", img: "https://image.tmdb.org/t/p/w500/p6k13YtNInQYgQO1uR9ZEXsVfH6.jpg", svc: "imdb" },
    { title: "Остров проклятых", img: "https://image.tmdb.org/t/p/w500/p402qN55Hn1Kq28K5T6rO9H5kY5.jpg", svc: "imdb" },
    { title: "Поймай меня, если сможешь", img: "https://image.tmdb.org/t/p/w500/70Q66tZ57H1X6w7Z5sX8mY8qO5h.jpg", svc: "imdb" },
    { title: "Семь", img: "https://image.tmdb.org/t/p/w500/6908ZJ6A9y5L3V2n5K8a4GZz1Q3.jpg", svc: "imdb" },
    // You can add more here...
  ],
  games: [
    { title: "The Witcher 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_184x69.jpg", svc: "steam" },
    { title: "Cyberpunk 2077", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_184x69.jpg", svc: "steam" },
    { title: "Elden Ring", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_184x69.jpg", svc: "steam" },
    { title: "GTA V", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/capsule_184x69.jpg", svc: "steam" },
    { title: "RDR 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_184x69.jpg", svc: "steam" },
    { title: "CS:GO", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_184x69.jpg", svc: "steam" },
    { title: "Dota 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_184x69.jpg", svc: "steam" },
    { title: "Baldur's Gate 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_184x69.jpg", svc: "steam" },
    { title: "Skyrim", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/capsule_184x69.jpg", svc: "steam" },
    { title: "Hollow Knight", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/capsule_184x69.jpg", svc: "steam" },
    { title: "Hades", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/capsule_184x69.jpg", svc: "steam" },
    { title: "Terraria", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/capsule_184x69.jpg", svc: "steam" },
    { title: "Stardew Valley", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/capsule_184x69.jpg", svc: "steam" },
    { title: "Portal 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/capsule_184x69.jpg", svc: "steam" },
    { title: "Half-Life 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220/capsule_184x69.jpg", svc: "steam" },
    { title: "DOOM Eternal", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/capsule_184x69.jpg", svc: "steam" },
    { title: "Fallout: New Vegas", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/22380/capsule_184x69.jpg", svc: "steam" },
    { title: "Dark Souls 3", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/capsule_184x69.jpg", svc: "steam" },
    { title: "Sekiro", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/capsule_184x69.jpg", svc: "steam" },
    { title: "Resident Evil 4", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/115160/capsule_184x69.jpg", svc: "steam" },
    { title: "Mass Effect 2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/24980/capsule_184x69.jpg", svc: "steam" },
    { title: "Rust", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/capsule_184x69.jpg", svc: "steam" },
    { title: "Subnautica", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/capsule_184x69.jpg", svc: "steam" },
    { title: "Phasmophobia", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/739630/capsule_184x69.jpg", svc: "steam" }
  ],
  actors: [
    { title: "Ди Каприо", img: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg", svc: "imdb" },
    { title: "Киану Ривз", img: "https://image.tmdb.org/t/p/w500/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg", svc: "imdb" },
    { title: "Скарлетт Йоханссон", img: "https://image.tmdb.org/t/p/w500/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg", svc: "imdb" },
    { title: "Том Харди", img: "https://image.tmdb.org/t/p/w500/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg", svc: "imdb" },
    { title: "Марго Робби", img: "https://image.tmdb.org/t/p/w500/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg", svc: "imdb" },
    { title: "Роберт Дауни мл.", img: "https://image.tmdb.org/t/p/w500/5qHNjhtjMD4YWH3UP0rm4tKwxIQ.jpg", svc: "imdb" },
    { title: "Кристиан Бэйл", img: "https://image.tmdb.org/t/p/w500/b7fTC9WFkgqGOv77mLQpliWorsS.jpg", svc: "imdb" },
    { title: "Натали Портман", img: "https://image.tmdb.org/t/p/w500/vkoGFlFhRhUwaKIfecX1rT22L2O.jpg", svc: "imdb" },
    { title: "Брэд Питт", img: "https://image.tmdb.org/t/p/w500/cckcYc2v0yh1tc9QjRelptcOBko.jpg", svc: "imdb" },
    { title: "Джонни Депп", img: "https://image.tmdb.org/t/p/w500/yyB00XhPaPys7785Ff1UjK5wPaa.jpg", svc: "imdb" },
    { title: "Том Круз", img: "https://image.tmdb.org/t/p/w500/gThaIXgpCm3PCiXwFNDBJCme85y.jpg", svc: "imdb" },
    { title: "Мэттью Макконахи", img: "https://image.tmdb.org/t/p/w500/e9ZHRY5toiB6tgEQse5tn4SR804.jpg", svc: "imdb" },
    { title: "Энн Хэтэуэй", img: "https://image.tmdb.org/t/p/w500/tLelKoPNiyJC2311X2XG0eZzGqW.jpg", svc: "imdb" },
    { title: "Киллиан Мерфи", img: "https://image.tmdb.org/t/p/w500/3dz6bn88j2sFw7vYFmYj2wS0P8s.jpg", svc: "imdb" },
    { title: "Гэри Олдман", img: "https://image.tmdb.org/t/p/w500/2v9FVVBUrrkW2m3QOcYkuhq9A6o.jpg", svc: "imdb" },
    { title: "Райан Гослинг", img: "https://image.tmdb.org/t/p/w500/lyUyVARQEhce0A1K2u1Nksl8wMv.jpg", svc: "imdb" },
    { title: "Хит Леджер", img: "https://image.tmdb.org/t/p/w500/5Y9HnYYa9jF4NuYWQNFE4AeeO6E.jpg", svc: "imdb" },
    { title: "Анджелина Джоли", img: "https://image.tmdb.org/t/p/w500/wAjsYWwX79D0d90Z6aJtN1L8k8F.jpg", svc: "imdb" },
    { title: "Аль Пачино", img: "https://image.tmdb.org/t/p/w500/fMDFeVf0pjDpTJnuqGE1OaUwJC8.jpg", svc: "imdb" },
    { title: "Уилл Смит", img: "https://image.tmdb.org/t/p/w500/eze9FO9VuryXLP0aF2cRqPCcibN.jpg", svc: "imdb" },
    { title: "Эмма Стоун", img: "https://image.tmdb.org/t/p/w500/cZ8a3QvAnj2cgcgVL6g4XaqXJp2.jpg", svc: "imdb" },
    { title: "Том Хэнкс", img: "https://image.tmdb.org/t/p/w500/xndWFsBlClOJFRdhStgX7pE9gCH.jpg", svc: "imdb" },
    { title: "Джейк Джилленхол", img: "https://image.tmdb.org/t/p/w500/rJdYHYNhlcOBwbPvDZVvtZXIAFz.jpg", svc: "imdb" },
    { title: "Крис Хемсворт", img: "https://image.tmdb.org/t/p/w500/jpurJ9jAcLCYvnqWTAQiSYWgwIs.jpg", svc: "imdb" },
    { title: "Марк Уолберг", img: "https://image.tmdb.org/t/p/w500/8tA5y2P7X491BqWj6B2a0x5KjNn.jpg", svc: "imdb" },
    { title: "Дэниэл Дэй-Льюис", img: "https://image.tmdb.org/t/p/w500/sTfQ4cMofvS83XhN1Yd317xGXY.jpg", svc: "imdb" },
    { title: "Роберт Де Ниро", img: "https://image.tmdb.org/t/p/w500/cT8htcckI7teZI11G1ZqM1rI8Y5.jpg", svc: "imdb" },
    { title: "Энтони Хопкинс", img: "https://image.tmdb.org/t/p/w500/7Z01yMhFwRz5t35VqL3I7aE7f1G.jpg", svc: "imdb" },
    { title: "Морган Фриман", img: "https://image.tmdb.org/t/p/w500/mIJI0nUoE001rF2Ue5Dq93aA4sI.jpg", svc: "imdb" },
    { title: "Харрисон Форд", img: "https://image.tmdb.org/t/p/w500/5M7oN3sznp99hWYQ9sX0xheswWX.jpg", svc: "imdb" }
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
    
    // ФИКС: Убрано экранирование (window.escapeHTML) для URL и IMG, чтобы ссылки не ломались
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
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect fill=%22%23333%22 width=%2264%22 height=%2264%22 rx=%228%22/%3E%3Ctext fill=%22white%22 x=%2232%22 y=%2236%22 text-anchor=%22middle%22 font-size=%2220%22%3E%3F%3C/text%3E%3C/svg%3E';">
        </a></div>`;
    }).join('');

    // Обновлен дизайн кнопки "+" для соответствия современному стилю
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
