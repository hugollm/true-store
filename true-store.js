const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        initialState = initialState || {};
        this.currentStateMap = Immutable.fromJS(initialState);
        this.dataListeners = {};
    }

    state() {
        return this.currentStateMap.toJS();
    }

    action(name, func) {
        var self = this;
        this.validateActionArguments(name, func);
        var newStateObject = this.currentStateMap.toJS();
        var newFunc = function() {
            func.apply(this, arguments);
            var oldStateMap = self.currentStateMap;
            self.currentStateMap = Immutable.fromJS(newStateObject);
            self.executeDataListeners(oldStateMap, self.currentStateMap);
        };
        return newFunc.bind(newStateObject);
    }

    validateActionArguments(name, func) {
        if (!name || typeof(name) != 'string') throw Error('TrueStore.action: invalid argument "name".');
        if (!func || typeof(func) != 'function') throw Error('TrueStore.action: invalid argument "func".');
        try {
            func.arguments;
        }
        catch(e) {
            throw Error('TrueStore.action: cannot create action with arrow function. Use regular functions instead.');
        }
    }

    listenData(key, callback) {
        this.dataListeners[key] = this.dataListeners[key] || [];
        this.dataListeners[key].push(callback);
    }

    unlistenData(key, callback) {
        this.dataListeners[key] = this.dataListeners[key] || [];
        var index = this.dataListeners[key].indexOf(callback);
        if (index == -1)
            throw 'TrueStore.unlistenData: key "' + key + '" is not registered.';
        this.dataListeners[key].splice(index, 1);
    }

    executeDataListeners(oldMap, newMap) {
        for (var key in this.dataListeners)
            this.dataListeners[key].map((callback) => {
                var pathArray = key.split('.');
                var oldValue = oldMap.getIn(pathArray);
                var newValue = newMap.getIn(pathArray);
                if (!Immutable.is(oldValue, newValue))
                    callback();
            });
    }
}


module.exports = TrueStore;
