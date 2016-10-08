const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        initialState = initialState || {};
        this.currentStateMap = Immutable.fromJS(initialState);
        this.dataListeners = [];
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

    listen(key, callback) {
        var path = key.split('.');
        this.dataListeners.push({path: path, callback: callback});
    }

    executeDataListeners(oldMap, newMap) {
        this.dataListeners.map((listener) => {
            var oldValue = oldMap.getIn(listener.path);
            var newValue = newMap.getIn(listener.path);
            if (!Immutable.is(oldValue, newValue))
                listener.callback();
        });
    }
}


module.exports = TrueStore;
