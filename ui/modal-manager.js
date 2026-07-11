/**
 * @module ui/modal-manager
 * @description Управление модальными окнами (стек, z-index, cleanup).
 */
class ModalManager {
  constructor() {
    this.stack = [];
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      display: none; z-index: 1000; justify-content: center;
      align-items: center; backdrop-filter: blur(4px);
    `;
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });
  }

  open(content, options = { closeOnEscape: true }) {
    const container = document.createElement('div');
    container.className = 'modal-box';
    container.style.zIndex = 1000 + this.stack.length * 10;
    container.appendChild(content);

    this.stack.push({ container, options, cleanup: content._cleanup || null, handleEscapeRef: null });

    this.overlay.innerHTML = '';
    this.overlay.appendChild(container);
    this.overlay.style.display = 'flex';
    this.overlay.style.zIndex = 1000 + (this.stack.length - 1) * 10;
    document.body.style.overflow = 'hidden';

    const handleEscape = e => {
      if (e.key === 'Escape' && options.closeOnEscape) this.close();
    };
    document.addEventListener('keydown', handleEscape);
    this.stack[this.stack.length - 1].handleEscapeRef = handleEscape;

    return () => this._removeFromStack(container);
  }

  _removeFromStack(container) {
    const index = this.stack.findIndex(item => item.container === container);
    if (index !== -1) {
      const item = this.stack[index];
      // ФИКС: раньше слушатель Escape снимался только при закрытии через возвращённую функцию.
      // Если закрывали кликом по фону, слушатель оставался в памяти навсегда.
      if (item.handleEscapeRef) document.removeEventListener('keydown', item.handleEscapeRef);
      if (item.cleanup) item.cleanup();
      this.stack.splice(index, 1);
    }

    if (this.stack.length === 0) {
      this.overlay.style.display = 'none';
      document.body.style.overflow = '';
    } else {
      const prev = this.stack[this.stack.length - 1];
      this.overlay.innerHTML = '';
      this.overlay.appendChild(prev.container);
    }
  }

  close() {
    if (this.stack.length > 0) {
      this._removeFromStack(this.stack[this.stack.length - 1].container);
    }
  }

  closeAll() {
    while (this.stack.length > 0) this.close();
  }
}

export const modalManager = new ModalManager();