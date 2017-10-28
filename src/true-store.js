const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        this.currentStateMap = Immutable.fromJS(initialState || {});
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

    executeListeners(oldMap, newMap) {
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


module.exports = TrueStore;
