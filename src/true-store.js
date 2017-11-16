const Immutable = require('immutable');


class TrueStore {

    constructor(initialState = {}) {
        if (typeof(initialState) !== 'object')
            throw Error('TrueStore: initial state must be an object.');
        this.stateMap = Immutable.fromJS(initialState);
        this.observers = [];
        this.transactionDepth = 0;
    }

    get(key = null) {
        if (key === null)
            return this.stateMap.toJS();
        if (typeof(key) !== 'string')
            throw Error('TrueStore.get: key must be string.');
        var pathArray = key.split('.');
        var value = this.stateMap.getIn(pathArray);
        if (value !== null && typeof(value) == 'object' && typeof(value.toJS) == 'function')
            value = value.toJS();
        return value;
    }

    set(key, value) {
        if (typeof(key) !== 'string')
            throw Error('TrueStore.set: key must be string.');
        var pathArray = key.split('.');
        var oldStateMap = this.stateMap;
        this.stateMap = this.stateMap.setIn(pathArray, Immutable.fromJS(value));
        if (this.transactionDepth === 0)
            this.notifyObservers(oldStateMap, this.stateMap);
    }

    merge(obj) {
        if (typeof(obj) !== 'object')
            throw Error('TrueStore.merge: state can only merge with an object.');
        var oldStateMap = this.stateMap;
        this.stateMap = this.stateMap.mergeDeep(obj);
        if (this.transactionDepth === 0)
            this.notifyObservers(oldStateMap, this.stateMap);
    }

    transaction(callback) {
        var oldStateMap = this.stateMap;
        this.transactionDepth++;
        callback();
        this.transactionDepth--;
        if (this.transactionDepth === 0)
            this.notifyObservers(oldStateMap, this.stateMap);
    }

    observer(callback, keys = []) {
        keys = Array.isArray(keys) ? keys : [keys];
        keys.map((key) => {
            if (typeof(key) !== 'string')
                throw Error('TrueStore.observer: keys must be strings.');
        });
        var observer = new TrueStoreObserver(this, callback, keys);
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

    constructor(store, callback, keys) {
        this.store = store;
        this.callback = callback;
        this.keys = keys;
    }

    release() {
        var index = this.store.observers.indexOf(this);
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
        var pathArray = key.split('.');
        var oldValue = oldMap.getIn(pathArray);
        var newValue = newMap.getIn(pathArray);
        return !Immutable.is(oldValue, newValue);
    }
}


module.exports = TrueStore;
