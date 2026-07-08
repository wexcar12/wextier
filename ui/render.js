/**
 * @module ui/render
 * @description Рендер тир-листов (list1, list2).
 */
import { state, MoveItemCommand } from '../core/state.js';
import { eventBus } from '../core/event-bus.js';

let editing = false;
let compare = false;
let aTT = null; // active target tier
let aTL = 1;    // active target list

export function isEditing() { return editing; }
export function isCompare() { return compare; }
export function setEditing(val) { editing = val; }
export function setCompare(val) { compare = val; }
export function getActiveTier() { return aTT; }
export function getActiveList() { return aTL; }
export function setActiveTier(t, l) { aTT = t; aTL = l; }

export function renderAll() {
  render(1);
  if (compare) render(2);
  eventBus.emit('render:after', { listNum: compare ? 2 : 1 });
}

export function render(listNum) {
  const el = document.getElementById(listNum === 1 ? 'list1' : 'list2');
  if (!el) return;

  const data = listNum === 1 ? state.data1 : state.data2;
  el.innerHTML = '';

  data.forEach((t, ti) => {
    const row = document.createElement('div');
    row.className = 'tier-row';

    const lbl = document.createElement('div');
    lbl.className = 'tier-label';
    lbl.style.backgroundColor = t.color || '#ff7f7f';
    lbl.textContent = t.label;
    lbl.title = 'Двойной клик — переименовать';

    lbl.ondblclick = () => {
      if (!editing || lbl.querySelector('input')) return;

      const ci = document.createElement('input');
      ci.type = 'color';
      ci.value = t.color || '#ff7f7f';
      ci.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:45%;border:none;cursor:pointer;padding:0;';

      const ni = document.createElement('input');
      ni.value = t.label;
      ni.maxLength = 8;
      ni.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:55%;background:transparent;border:1px solid rgba(0,0,0,0.3);text-align:center;font-weight:900;font-size:1.1rem;color:#111;outline:none;';

      lbl.textContent = '';
      lbl.style.position = 'relative';
      lbl.appendChild(ci);
      lbl.appendChild(ni);
      ci.focus();

      const done = () => {
        t.label = ni.value.trim() || t.label;
        t.color = ci.value;
        state._save();
        eventBus.emit('achievements:check');
        renderAll();
      };
      ni.onblur = done;
      ni.onkeypress = e => { if (e.key === 'Enter') ni.blur(); };
    };

    row.appendChild(lbl);

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'tier-items';
    itemsDiv.dataset.tierIndex = ti;
    itemsDiv.dataset.listNum = listNum;

    t.items.forEach((item, ii) => {
      const div = document.createElement('div');
      div.className = 'item';
      div.dataset.svc = item.svc;

      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.onclick = function(e) {
        if (item.svc === 'youtube') {
          e.preventDefault();
          const v = item.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
          if (v) {
            document.getElementById('playerFrame').src = 'https://www.youtube.com/embed/' + v[1] + '?autoplay=1';
            document.getElementById('playerModal').classList.add('open');
          }
        }
      };

      const img = document.createElement('img');
      img.src = item.img || pImg(item.svc);
      img.alt = '';
      img.onerror = function() { this.src = pImg(item.svc); };
      img.addEventListener('dragstart', e => e.preventDefault());
      a.appendChild(img);
      div.appendChild(a);

      const delBtn = document.createElement('button');
      delBtn.className = 'del-btn';
      delBtn.innerHTML = '<i data-lucide="x"></i>';
      delBtn.dataset.tierIndex = ti;
      delBtn.dataset.itemIndex = ii;
      delBtn.dataset.listNum = listNum;
      div.appendChild(delBtn);

      itemsDiv.appendChild(div);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.innerHTML = '<i data-lucide="plus"></i>';
    addBtn.dataset.tierIndex = ti;
    addBtn.dataset.listNum = listNum;
    itemsDiv.appendChild(addBtn);

    row.appendChild(itemsDiv);

    if (t.items.length === 0) {
      const dt = document.createElement('button');
      dt.className = 'del-btn';
      dt.style.right = 'auto';
      dt.style.left = '-8px';
      dt.innerHTML = '<i data-lucide="trash-2"></i>';
      dt.dataset.tierIndex = ti;
      dt.dataset.listNum = listNum;
      row.appendChild(dt);
    }

    el.appendChild(row);
  });
}

function pImg(svc) {
  const colors = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00', steam: '#171a21', imdb: '#f5c518' };
  const icons = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪', steam: '🎮', imdb: '🎬' };
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="' + (colors[svc] || '#555') + '" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">' + (icons[svc] || '?') + '</text></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function updateUI() {
  document.body.classList.toggle('editing', editing);
  const eb = document.getElementById('editBtn');
  if (eb) eb.innerHTML = editing ? '<i data-lucide="check"></i> Готово' : '<i data-lucide="edit-3"></i> Редактировать';
  if (editing && eb) eb.classList.add('primary'); else if (eb) eb.classList.remove('primary');

  const resetBtn = document.getElementById('resetBtn');
  const addTierBtn = document.getElementById('addTierBtn');
  if (resetBtn) resetBtn.classList.toggle('hidden', !editing);
  if (addTierBtn) addTierBtn.classList.toggle('hidden', !editing);

  const col2 = document.getElementById('col2');
  if (col2) col2.style.display = compare ? 'block' : 'none';

  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) undoBtn.disabled = !state.canUndo(compare ? 2 : 1);

  lucide.createIcons();
}

export function updateUndo() {
  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) undoBtn.disabled = !state.canUndo(compare ? 2 : 1);
}