/**
 * @module core/state
 * @description Управление состоянием через Command Pattern.
 */
import { eventBus } from './event-bus.js';

// Единый источник стандартного набора тиров S/A/B/C. Фабрика (а не константа),
// чтобы каждый вызов возвращал свежие объекты — без общих ссылок на массивы items.
export function defaultTiers() {
  return [
    { tier: 'S', label: 'S', color: '#ff7f7f', items: [] },
    { tier: 'A', label: 'A', color: '#ffbf7f', items: [] },
    { tier: 'B', label: 'B', color: '#ffdf7f', items: [] },
    { tier: 'C', label: 'C', color: '#bfff7f', items: [] },
  ];
}

class Command { execute(state) { throw new Error('Not implemented'); } undo(state) { throw new Error('Not implemented'); } }

class MoveItemCommand extends Command {
  constructor(fromTierIndex, toTierIndex, fromItemIndex, toItemIndex, listNum) {
    super(); this.fromTierIndex = fromTierIndex; this.toTierIndex = toTierIndex;
    this.fromItemIndex = fromItemIndex; this.toItemIndex = toItemIndex; this.listNum = listNum;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    const item = data[this.fromTierIndex].items.splice(this.fromItemIndex, 1)[0];
    data[this.toTierIndex].items.splice(this.toItemIndex, 0, item);
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    const item = data[this.toTierIndex].items.splice(this.toItemIndex, 1)[0];
    data[this.fromTierIndex].items.splice(this.fromItemIndex, 0, item);
    return state;
  }
}

// НОВАЯ КОМАНДА: Перенос между тир-листами (Compare Mode)
class MoveCrossListCommand extends Command {
  constructor(fromTier, toTier, fromIndex, toIndex, fromList, toList) {
    super(); this.fromTier = fromTier; this.toTier = toTier; this.fromIndex = fromIndex; this.toIndex = toIndex;
    this.fromList = fromList; this.toList = toList;
  }
  execute(state) {
    const fromData = this.fromList === 1 ? state.data1 : state.data2;
    const toData = this.toList === 1 ? state.data1 : state.data2;
    const item = fromData[this.fromTier].items.splice(this.fromIndex, 1)[0];
    toData[this.toTier].items.splice(this.toIndex, 0, item);
    return state;
  }
  undo(state) {
    const fromData = this.fromList === 1 ? state.data1 : state.data2;
    const toData = this.toList === 1 ? state.data1 : state.data2;
    const item = toData[this.toTier].items.splice(this.toIndex, 1)[0];
    fromData[this.fromTier].items.splice(this.fromIndex, 0, item);
    return state;
  }
}

class AddItemCommand extends Command {
  constructor(tierIndex, item, listNum, insertIndex = -1) {
    super(); this.tierIndex = tierIndex; this.item = item; this.listNum = listNum; this.insertIndex = insertIndex;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    if (this.insertIndex >= 0) data[this.tierIndex].items.splice(this.insertIndex, 0, this.item);
    else data[this.tierIndex].items.push(this.item);
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    if (this.insertIndex >= 0) data[this.tierIndex].items.splice(this.insertIndex, 1);
    else data[this.tierIndex].items.pop();
    return state;
  }
}

class RemoveItemCommand extends Command {
  constructor(tierIndex, itemIndex, item, listNum) {
    super(); this.tierIndex = tierIndex; this.itemIndex = itemIndex; this.item = item; this.listNum = listNum;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data[this.tierIndex].items.splice(this.itemIndex, 1);
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data[this.tierIndex].items.splice(this.itemIndex, 0, this.item);
    return state;
  }
}

class AddTierCommand extends Command {
  constructor(tier, listNum) {
    super(); this.tier = tier; this.listNum = listNum;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data.push(this.tier);
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data.pop();
    return state;
  }
}

class MoveTierCommand extends Command {
  constructor(fromIndex, toIndex, listNum) {
    super(); this.fromIndex = fromIndex; this.toIndex = toIndex; this.listNum = listNum;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    const [tier] = data.splice(this.fromIndex, 1);
    data.splice(this.toIndex, 0, tier);
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    const [tier] = data.splice(this.toIndex, 1);
    data.splice(this.fromIndex, 0, tier);
    return state;
  }
}

// Удаление тира с сохранением его самого (и всех карточек внутри) для отмены.
// В отличие от старого пути через setData(), который стирал всю историю, это
// нормальная команда — Ctrl+Z вернёт удалённый тир вместе с содержимым на своё место.
class RemoveTierCommand extends Command {
  constructor(tierIndex, tier, listNum) {
    super(); this.tierIndex = tierIndex; this.tier = tier; this.listNum = listNum;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data.splice(this.tierIndex, 1);
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data.splice(this.tierIndex, 0, this.tier);
    return state;
  }
}

// Изменение подписи/цвета тира через историю — одна отмена возвращает и текст, и цвет.
class EditTierCommand extends Command {
  constructor(tierIndex, oldLabel, oldColor, newLabel, newColor, listNum) {
    super();
    this.tierIndex = tierIndex;
    this.oldLabel = oldLabel; this.oldColor = oldColor;
    this.newLabel = newLabel; this.newColor = newColor;
    this.listNum = listNum;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    const t = data[this.tierIndex];
    if (t) { t.label = this.newLabel; t.color = this.newColor; }
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    const t = data[this.tierIndex];
    if (t) { t.label = this.oldLabel; t.color = this.oldColor; }
    return state;
  }
}

// Сброс набора тиров к стандартному (S/A/B/C). Массив мутируется на месте
// (length=0 + push), чтобы сохранить ту же ссылку state.data1/data2, на которую
// опираются остальные команды. Хранит старый и новый набор как глубокие копии.
class ResetTiersCommand extends Command {
  constructor(oldTiers, newTiers, listNum) {
    super(); this.oldTiers = oldTiers; this.newTiers = newTiers; this.listNum = listNum;
  }
  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data.length = 0;
    this.newTiers.forEach(t => data.push(t));
    return state;
  }
  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    data.length = 0;
    this.oldTiers.forEach(t => data.push(t));
    return state;
  }
}

class StateManager {
  constructor() {
    this.history1 = []; this.history2 = []; this.index1 = -1; this.index2 = -1;
    this.data1 = defaultTiers(); this.data2 = defaultTiers();
    // Название и описание тир-листа (основного списка). Не входят в историю команд —
    // это метаданные доски, а не её содержимое; правятся напрямую и сохраняются в черновик.
    this.title = ''; this.desc = '';
    // ФИКС: редактирование теперь включено всегда — отдельная кнопка "Редактировать" убрана
    // по требованию пользователя. Firestore-правила и так разрешают запись в опубликованный
    // тир-лист только его автору, так что физически испортить чужие данные нельзя.
    this.ui = { editing: true, compare: false, activeTier: null, activeList: 1 };
  }
  setUI(key, value) { this.ui[key] = value; eventBus.emit('ui:state:changed', { key, value, state: this.ui }); }
  // Установка заголовка/описания доски. Пустая история не трогается — это метаданные.
  setMeta(title, desc) {
    this.title = (title || '').slice(0, 80);
    this.desc = (desc || '').slice(0, 300);
    eventBus.emit('state:changed', { listNum: 1 }); this._save();
  }
  executeCommand(command, listNum = 1) {
    const history = listNum === 1 ? this.history1 : this.history2;
    const index = listNum === 1 ? this.index1 : this.index2;
    history.length = index + 1;
    command._seq = (this._cmdSeq = (this._cmdSeq || 0) + 1);
    history.push(command);
    command.execute(this);
    if (listNum === 1) this.index1 = history.length - 1; else this.index2 = history.length - 1;
    if (history.length > 50) { history.shift(); if (listNum === 1) this.index1--; else this.index2--; }
    eventBus.emit('state:changed', { listNum }); this._save();
  }
  undo(listNum = 1) {
    const history = listNum === 1 ? this.history1 : this.history2;
    let index = listNum === 1 ? this.index1 : this.index2;
    if (index < 0) return;
    history[index].undo(this);
    if (listNum === 1) this.index1--; else this.index2--;
    eventBus.emit('state:changed', { listNum }); this._save();
  }
  redo(listNum = 1) {
    const history = listNum === 1 ? this.history1 : this.history2;
    let index = listNum === 1 ? this.index1 : this.index2;
    if (index >= history.length - 1) return;
    if (listNum === 1) this.index1++; else this.index2++;
    history[listNum === 1 ? this.index1 : this.index2].execute(this);
    eventBus.emit('state:changed', { listNum }); this._save();
  }
  canUndo(listNum = 1) { return listNum === 1 ? this.index1 >= 0 : this.index2 >= 0; }
  canRedo(listNum = 1) { return listNum === 1 ? this.index1 < this.history1.length - 1 : this.index2 < this.history2.length - 1; }
  // В режиме сравнения истории двух списков независимы, но кросс-списочная команда живёт
  // лишь в одной из них. Чтобы undo/redo шли в реальном порядке действий, выбираем список
  // по временной метке команды: для undo — с самой свежей вершиной (max _seq),
  // для redo — со следующей по времени командой (min _seq среди доступных к возврату).
  undoList() {
    const t1 = this.canUndo(1) ? (this.history1[this.index1]?._seq ?? -1) : -1;
    const t2 = this.canUndo(2) ? (this.history2[this.index2]?._seq ?? -1) : -1;
    if (t1 < 0 && t2 < 0) return null;
    return t2 > t1 ? 2 : 1;
  }
  redoList() {
    const t1 = this.canRedo(1) ? (this.history1[this.index1 + 1]?._seq ?? Infinity) : Infinity;
    const t2 = this.canRedo(2) ? (this.history2[this.index2 + 1]?._seq ?? Infinity) : Infinity;
    if (t1 === Infinity && t2 === Infinity) return null;
    return t2 < t1 ? 2 : 1;
  }
  setData(data, listNum = 1) {
    if (listNum === 1) this.data1 = structuredClone(data); else this.data2 = structuredClone(data);
    if (listNum === 1) { this.history1 = []; this.index1 = -1; } else { this.history2 = []; this.index2 = -1; }
    eventBus.emit('state:changed', { listNum }); this._save();
  }
  // Публичный сброс в сохранение. Для внешних модулей, которые правят данные напрямую
  // (вне команд undo/redo) и должны попросить состояние сохраниться — вместо прямого
  // дёргания приватного _save() из UI-кода.
  save() { this._save(); }
  // Сохранение идёт через trailing-дебаунс на 100 мс: первый вызов ставит таймер,
  // все последующие в течение окна схлопываются в одну запись в localStorage.
  // flushSave() принудительно сбрасывает отложенное сохранение (перед выгрузкой).
  _save() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => { this._saveTimer = null; eventBus.emit('state:needsSave', { data1: this.data1, data2: this.data2 }); }, 100);
  }
  flushSave() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
      eventBus.emit('state:needsSave', { data1: this.data1, data2: this.data2 });
    }
  }
}

export const state = new StateManager();
export { MoveItemCommand, MoveCrossListCommand, AddItemCommand, RemoveItemCommand, AddTierCommand, MoveTierCommand, RemoveTierCommand, EditTierCommand, ResetTiersCommand };
