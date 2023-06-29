export default class Bus {
    constructor() {
        this.listeners = new Map();
        this.emited = new Set();
    }
    on(evtName, listener) {
        if (this.emited.has(evtName)) {
            listener();
            return;
        }
        const target = this.listeners.get(evtName) || [];
        target.push(listener);
        this.listeners.set(evtName, target);
    }
    emit(evtName) {
        const listeners = this.listeners.get(evtName);
        if (listeners) {
            listeners.forEach((func) => func());
            this.emited.add(evtName);
        }
    }
}
