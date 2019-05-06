const Immutable = require('immutable');


class TrueStore {

    constructor(initialState = {}) {
        if (typeof(initialState) !== 'object')
            throw Error('TrueStore: initial state must be an object.');
        this.initialMap = Immutable.fromJS(initialState);
        this.stateMap = this.initialMap;
        this.observers = [];
        this.transactionDepth = 0;
    }

    get(key = null) {
        if (key === null)
            return this.stateMap.toJS();
        if (typeof(key) !== 'string')
            throw Error('TrueStore.get: key must be string.');
        let pathArray = key.split('.');
        let value = this.stateMap.getIn(pathArray);
        if (value !== null && typeof(value) == 'object' && typeof(value.toJS) == 'function')
            value = value.toJS();
        return value;
    }

    set(key, value) {
        if (typeof(key) !== 'string')
            throw Error('TrueStore.set: key must be string.');
        let pathArray = key.split('.');
        let newMap = this.stateMap.setIn(pathArray, Immutable.fromJS(value));
        this.updateState(newMap);
    }

    del(key) {
        if (typeof(key) !== 'string')
            throw Error('TrueStore.del: key must be string.');
        let pathArray = key.split('.');
        this.updateState(this.stateMap.deleteIn(pathArray));
    }

    merge(obj) {
        if (typeof(obj) !== 'object')
            throw Error('TrueStore.merge: state can only merge with an object.');
        this.updateState(this.stateMap.mergeDeep(obj));
    }

    reset() {
        this.updateState(this.initialMap);
    }

    updateState(newMap) {
        let oldMap = this.stateMap;
        this.stateMap = newMap;
        if (this.transactionDepth === 0)
            this.notifyObservers(oldMap, newMap);
    }

    transaction(callback) {
        let oldMap = this.stateMap;
        this.transactionDepth++;
        callback();
        this.transactionDepth--;
        if (this.transactionDepth === 0)
            this.notifyObservers(oldMap, this.stateMap);
    }

    observer(callback, keys = null) {
        if (keys === null)
            keys = [];
        keys = Array.isArray(keys) ? keys : [keys];
        keys.map((key) => {
            if (typeof(key) !== 'string')
                throw Error('TrueStore.observer: keys must be strings.');
        });
        let observer = new TrueStoreObserver(this, keys, callback);
        this.observers.push(observer);
        return observer;
    }

    notifyObservers(oldMap, newMap) {
        this.observers.map((observer) => {
            observer.callIfNeeded(oldMap, newMap);
        });
    }
}


class TrueStoreObserver {

    constructor(store, keys, callback) {
        this.store = store;
        this.keys = keys;
        this.callback = callback;
    }

    release() {
        let index = this.store.observers.indexOf(this);
        this.store.observers.splice(index, 1);
    }

    callIfNeeded(oldMap, newMap) {
        if (this.keys.length === 0 && !Immutable.is(oldMap, newMap))
            this.callback();
        if (this.keys.length > 0)
            this.keys.map(key => {
                if (this.stateKeyChanged(key, oldMap, newMap))
                    this.callback();
            });
    }

    stateKeyChanged(key, oldMap, newMap) {
        let pathArray = key.split('.');
        let oldValue = oldMap.getIn(pathArray);
        let newValue = newMap.getIn(pathArray);
        return !Immutable.is(oldValue, newValue);
    }
}


module.exports = TrueStore;
