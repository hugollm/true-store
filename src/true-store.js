const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        this.currentStateMap = Immutable.fromJS(initialState || {});
        this.observers = [];
        this.listeners = {};
        this.transactionDepth = 0;
    }

    get(key) {
        if (key === undefined)
            return this.currentStateMap.toJS();
        var pathArray = key.split('.');
        var value = this.currentStateMap.getIn(pathArray);
        if (value !== null && typeof(value) == 'object' && typeof(value.toJS) == 'function')
            value = value.toJS();
        return value;
    }

    set(key, value) {
        var pathArray = key.split('.');
        var oldStateMap = this.currentStateMap;
        this.currentStateMap = this.currentStateMap.setIn(pathArray, Immutable.fromJS(value));
        if (this.transactionDepth === 0)
            this.executeListeners(oldStateMap, this.currentStateMap);
    }

    transaction(fn) {
        var oldStateMap = this.currentStateMap;
        this.transactionDepth++;
        fn();
        this.transactionDepth--;
        if (this.transactionDepth === 0)
            this.executeListeners(oldStateMap, this.currentStateMap);
    }

    observer(callback, keys = []) {
        keys = Array.isArray(keys) ? keys : [keys];
        var observer = new TrueStoreObserver(this, callback, keys);
        this.observers.push(observer);
        return observer;
    }

    listen(key, callback) {
        this.listeners[key] = this.listeners[key] || [];
        this.listeners[key].push(callback);
    }

    unlisten(key, callback) {
        this.listeners[key] = this.listeners[key] || [];
        var index = this.listeners[key].indexOf(callback);
        if (index == -1)
            throw 'TrueStore.unlisten: key "' + key + '" is not registered.';
        this.listeners[key].splice(index, 1);
    }

    notifyObservers(oldMap, newMap) {
        this.observers.map((observer) => {
            observer.callIfNeeded(oldMap, newMap);
        });
    }

    executeListeners(oldMap, newMap) {
        this.notifyObservers(oldMap, newMap);
        for (var key in this.listeners)
            this.listeners[key].map((callback) => {
                var pathArray = key.split('.');
                var oldValue = oldMap.getIn(pathArray);
                var newValue = newMap.getIn(pathArray);
                if (!Immutable.is(oldValue, newValue))
                    callback();
            });
    }
}


class TrueStoreObserver {

    constructor(store, callback, keys = []) {
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
