export default class Bus {
    listeners: Map<string, any>;
    emited: Set<string>;
    constructor();
    on(evtName: string, listener: any): void;
    emit(evtName: string): void;
}
