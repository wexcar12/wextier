/**
 * @module ui/toast
 * @description Система уведомлений.
 */
import { eventBus } from '../core/event-bus.js';

class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column-reverse; gap: 8px;
    `;
    document.body.appendChild(this.container);

    eventBus.on('toast:show', ({ text, type = 'info' }) => this.show(text, type));
  }

  show(text, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Глобальная функция для обратной совместимости
window.toast = function(text) {
  if (window._toastManager) {
    window._toastManager.show(text, 'info');
  } else {
    // Fallback
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
};

export const toastManager = new ToastManager();
window._toastManager = toastManager;