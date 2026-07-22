/**
 * @module core/event-bus
 * @description Центральная шина событий. Полная развязка модулей.
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  once(event, callback) {
    const wrapper = (...args) => { callback(...args); this.off(event, wrapper); };
    return this.on(event, wrapper);
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach(cb => {
      try { cb(payload); } catch(e) { console.error(`EventBus [${event}]:`, e); }
    });
  }
}

export const eventBus = new EventBus();