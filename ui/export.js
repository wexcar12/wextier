/**
 * @module ui/export
 * @description Экспорт PNG и JSON, импорт JSON.
 */
import { state } from '../core/state.js';
import { renderAll } from './render.js';
import { eventBus } from '../core/event-bus.js';

export async function exportPNG() {
  const btn = document.getElementById('pngBtn');
  if (btn) btn.disabled = true;

  try {
    const el = document.getElementById('list1');
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true });
      const a = document.createElement('a');
      a.download = 'wex-tier.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } else {
      eventBus.emit('toast:show', { text: 'Экспорт PNG недоступен — библиотека не загружена', type: 'error' });
    }
  } catch (e) {
    eventBus.emit('toast:show', { text: 'Ошибка PNG', type: 'error' });
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
      renderAll();
      eventBus.emit('toast:show', { text: 'Загружено!', type: 'success' });
    } catch (ex) {
      eventBus.emit('toast:show', { text: 'Ошибка формата', type: 'error' });
    }
  };
  reader.readAsText(file);
}