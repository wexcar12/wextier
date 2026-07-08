/**
 * @module core/state
 * @description Управление состоянием через Command Pattern.
 *              Единый источник истины для данных и UI.
 */
import { eventBus } from './event-bus.js';

class Command {
  execute(state) { throw new Error('Not implemented'); }
  undo(state) { throw new Error('Not implemented'); }
}

class MoveItemCommand extends Command {
  constructor(itemId, fromTierIndex, toTierIndex, fromItemIndex, toItemIndex, listNum) {
    super();
    this.itemId = itemId;
    this.fromTierIndex = fromTierIndex;
    this.toTierIndex = toTierIndex;
    this.fromItemIndex = fromItemIndex;
    this.toItemIndex = toItemIndex;
    this.listNum = listNum;
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

class AddItemCommand extends Command {
  constructor(tierIndex, item, listNum, insertIndex = -1) {
    super();
    this.tierIndex = tierIndex;
    this.item = item;
    this.listNum = listNum;
    this.insertIndex = insertIndex;
  }

  execute(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    if (this.insertIndex >= 0) {
      data[this.tierIndex].items.splice(this.insertIndex, 0, this.item);
    } else {
      data[this.tierIndex].items.push(this.item);
    }
    return state;
  }

  undo(state) {
    const data = this.listNum === 1 ? state.data1 : state.data2;
    if (this.insertIndex >= 0) {
      data[this.tierIndex].items.splice(this.insertIndex, 1);
    } else {
      data[this.tierIndex].items.pop();
    }
    return state;
  }
}

class RemoveItemCommand extends Command {
  constructor(tierIndex, itemIndex, item, listNum) {
    super();
    this.tierIndex = tierIndex;
    this.itemIndex = itemIndex;
    this.item = item;
    this.listNum = listNum;
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

class StateManager {
  constructor() {
    this.history1 = [];
    this.history2 = [];
    this.index1 = -1;
    this.index2 = -1;

    this.data1 = this._defaultData();
    this.data2 = this._defaultData();

    this.ui = {
      editing: false,
      compare: false,
      activeTier: null,
      activeList: 1
    };
  }

  setUI(key, value) {
    this.ui[key] = value;
    eventBus.emit('ui:state:changed', { key, value, state: this.ui });
  }

  _defaultData() {
    return [
      { tier: 'S', label: 'S', color: '#ff7f7f', items: [] },
      { tier: 'A', label: 'A', color: '#ffbf7f', items: [] },
      { tier: 'B', label: 'B', color: '#ffdf7f', items: [] },
      { tier: 'C', label: 'C', color: '#bfff7f', items: [] },
    ];
  }

  executeCommand(command, listNum = 1) {
    const history = listNum === 1 ? this.history1 : this.history2;
    const index = listNum === 1 ? this.index1 : this.index2;

    history.length = index + 1;
    history.push(command);

    command.execute(this);

    if (listNum === 1) this.index1 = history.length - 1;
    else this.index2 = history.length - 1;

    if (history.length > 50) {
      history.shift();
      if (listNum === 1) this.index1--;
      else this.index2--;
    }

    eventBus.emit('state:changed', { listNum });
    this._save();
  }

  undo(listNum = 1) {
    const history = listNum === 1 ? this.history1 : this.history2;
    let index = listNum === 1 ? this.index1 : this.index2;

    if (index < 0) return;

    history[index].undo(this);

    if (listNum === 1) this.index1--;
    else this.index2--;

    eventBus.emit('state:changed', { listNum });
    this._save();
  }

  redo(listNum = 1) {
    const history = listNum === 1 ? this.history1 : this.history2;
    let index = listNum === 1 ? this.index1 : this.index2;

    if (index >= history.length - 1) return;

    if (listNum === 1) this.index1++;
    else this.index2++;

    history[listNum === 1 ? this.index1 : this.index2].execute(this);
    eventBus.emit('state:changed', { listNum });
    this._save();
  }

  canUndo(listNum = 1) {
    const index = listNum === 1 ? this.index1 : this.index2;
    return index >= 0;
  }

  setData(data, listNum = 1) {
    if (listNum === 1) this.data1 = JSON.parse(JSON.stringify(data));
    else this.data2 = JSON.parse(JSON.stringify(data));
    if (listNum === 1) { this.history1 = []; this.index1 = -1; }
    else { this.history2 = []; this.index2 = -1; }
    eventBus.emit('state:changed', { listNum });
    this._save();
  }

  _save() {
    eventBus.emit('state:needsSave', { data1: this.data1, data2: this.data2 });
  }
}

export const state = new StateManager();
export { MoveItemCommand, AddItemCommand, RemoveItemCommand };
