/**
 * @module ui/modal-manager
 * @description Управление модальными окнами (стек, z-index, cleanup, focus trap, aria).
 */
class ModalManager {
  constructor() {
    this.stack = [];
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      display: none; z-index: 1000; justify-content: center;
      align-items: flex-start; padding: 40px 16px; overflow-y: auto;
      backdrop-filter: blur(4px);
    `;
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });
  }

  open(content, options = { closeOnEscape: true }) {
    const trigger = document.activeElement;
    const container = document.createElement('div');
    container.className = 'modal-box';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.style.zIndex = 1000 + this.stack.length * 10;
    container.appendChild(content);

    this.stack.push({ container, options, cleanup: content._cleanup || null, handleEscapeRef: null, handleTrapRef: null, trigger });

    this.overlay.innerHTML = '';
    this.overlay.appendChild(container);
    this.overlay.style.display = 'flex';
    this.overlay.style.zIndex = 1000 + (this.stack.length - 1) * 10;
    document.body.style.overflow = 'hidden';

    const handleEscape = e => {
      if (e.key === 'Escape' && options.closeOnEscape) this.close();
    };
    const handleTrap = e => {
      if (e.key !== 'Tab') return;
      const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTrap);
    this.stack[this.stack.length - 1].handleEscapeRef = handleEscape;
    this.stack[this.stack.length - 1].handleTrapRef = handleTrap;

    const firstFocusable = container.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) requestAnimationFrame(() => firstFocusable.focus());

    return () => this._removeFromStack(container);
  }

  _removeFromStack(container) {
    const index = this.stack.findIndex(item => item.container === container);
    if (index !== -1) {
      const item = this.stack[index];
      if (item.handleEscapeRef) document.removeEventListener('keydown', item.handleEscapeRef);
      if (item.handleTrapRef) document.removeEventListener('keydown', item.handleTrapRef);
      if (item.cleanup) item.cleanup();
      const trigger = item.trigger;
      this.stack.splice(index, 1);

      if (this.stack.length === 0) {
        this.overlay.style.display = 'none';
        document.body.style.overflow = '';
        if (trigger && trigger.focus) try { trigger.focus(); } catch {}
      } else {
        const prev = this.stack[this.stack.length - 1];
        this.overlay.innerHTML = '';
        this.overlay.appendChild(prev.container);
      }
      return;
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
