const Immutable = require('immutable');
const Observer = require('./observer');


class Store {

    constructor(initialState = {}) {
        if (typeof(initialState) !== 'object')
            throw Error('Store: initial state must be an object.');
        this.initialMap = Immutable.fromJS(initialState);
        this.stateMap = this.initialMap;
        this.observers = [];
        this.transactionDepth = 0;
        Store.instances.push(this);
    }

    get(key = null) {
        if (key === null)
            return this.stateMap.toJS();
        if (typeof(key) !== 'string')
            throw Error('Store.get: key must be string.');
        let pathArray = key.split('.');
        let value = this.stateMap.getIn(pathArray);
        if (value !== null && typeof(value) == 'object' && typeof(value.toJS) == 'function')
            value = value.toJS();
        return value;
    }

    set(key, value) {
        if (typeof(key) !== 'string')
            throw Error('Store.set: key must be string.');
        let pathArray = key.split('.');
        let newMap = this.stateMap.setIn(pathArray, Immutable.fromJS(value));
        this.updateState(newMap);
    }

    del(key) {
        if (typeof(key) !== 'string')
            throw Error('Store.del: key must be string.');
        let pathArray = key.split('.');
        this.updateState(this.stateMap.deleteIn(pathArray));
    }

    merge(obj) {
        if (typeof(obj) !== 'object')
            throw Error('Store.merge: state can only merge with an object.');
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

    observer(callback, keys = []) {
        let err = 'Store.observer: keys must be an array of strings.';
        if (!Array.isArray(keys))
            throw Error(err);
        for (let i in keys)
            if (typeof(keys[i]) !== 'string')
                throw Error(err);
        let observer = new Observer(this, keys, callback);
        this.observers.push(observer);
        return observer;
    }

    notifyObservers(oldMap, newMap) {
        this.observers.map((observer) => {
            observer.callIfNeeded(oldMap, newMap);
        });
    }
}

Store.instances = [];

Store.resetAll = function() {
    for (let i in Store.instances)
        Store.instances[i].reset();
}


module.exports = Store;
