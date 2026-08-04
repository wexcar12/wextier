/**
 * @module ui/export
 * @description Экспорт PNG и JSON, импорт JSON.
 */
import { state } from '../core/state.js';
import { renderAll } from './render.js';
import { eventBus } from '../core/event-bus.js';
import { escapeHTML } from '../utils/sanitizers.js';
import { loadScript } from '../utils/lazy-load.js';

const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

// Временный заголовок для PNG: название + описание рисуем поверх списка, чтобы они
// попали в экспорт. Возвращает вставленный элемент (или null), который потом удаляем.
function injectExportHeader(listEl) {
  const title = (state.title || '').trim();
  const desc = (state.desc || '').trim();
  if (!title && !desc) return null;
  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;padding:8px 12px 16px;';
  header.innerHTML =
    (title ? `<div style="font-size:26px;font-weight:700;color:#fff;line-height:1.2;">${escapeHTML(title)}</div>` : '') +
    (desc ? `<div style="font-size:14px;color:#cfcfcf;margin-top:6px;line-height:1.4;">${escapeHTML(desc)}</div>` : '');
  listEl.insertBefore(header, listEl.firstChild);
  return header;
}

export async function exportPNG() {
  const btn = document.getElementById('pngBtn');
  if (btn) btn.disabled = true;

  const el = document.getElementById('list1');
  let header = null;
  try {
    // Ф6-3: html2canvas (~200 КБ) грузим лениво только здесь, при первом экспорте PNG,
    // а не при загрузке страницы. Промис кэшируется — повторный экспорт мгновенный.
    if (typeof html2canvas === 'undefined') {
      try { await loadScript(HTML2CANVAS_URL); }
      catch { eventBus.emit('toast:show', { text: 'Не удалось загрузить библиотеку экспорта PNG', type: 'error' }); if (btn) btn.disabled = false; return; }
    }
    if (typeof html2canvas !== 'undefined') {
      header = injectExportHeader(el);
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true });
      const a = document.createElement('a');
      a.download = 'wex-tier.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      eventBus.emit('analytics:event', 'export_png');
    } else {
      eventBus.emit('toast:show', { text: 'Экспорт PNG недоступен — библиотека не загружена', type: 'error' });
    }
  } catch (e) {
    eventBus.emit('toast:show', { text: 'Ошибка PNG', type: 'error' });
  } finally {
    if (header && header.parentNode) header.parentNode.removeChild(header);
  }

  if (btn) btn.disabled = false;
}

export function exportJSON() {
  const blob = new Blob([JSON.stringify(state.data1, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = 'wex-tier.json';
  a.click();
  eventBus.emit('analytics:event', 'export_json');
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importJSON(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const d = JSON.parse(e.target.result);
      if (!Array.isArray(d) || d.length === 0) {
        eventBus.emit('toast:show', { text: 'Ошибка формата: ожидается массив тиров', type: 'error' });
        return;
      }
      const valid = d.every(t => t && (typeof t.tier === 'string' || typeof t.label === 'string') && Array.isArray(t.items) && typeof t.color === 'string');
      if (!valid) {
        eventBus.emit('toast:show', { text: 'Ошибка формата: каждый тир должен иметь tier/label, items и color', type: 'error' });
        return;
      }
      d.forEach(t => {
        if (!t.label) t.label = t.tier;
        if (!t.tier) t.tier = t.label;
      });
      state.setData(d, 1);
      eventBus.emit('achievements:check');
      eventBus.emit('analytics:event', 'import_json');
      renderAll();
      eventBus.emit('toast:show', { text: 'Загружено!', type: 'success' });
    } catch (ex) {
      eventBus.emit('toast:show', { text: 'Ошибка формата', type: 'error' });
    }
  };
  reader.readAsText(file);
}