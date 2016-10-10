const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        initialState = initialState || {};
        this.currentStateMap = Immutable.fromJS(initialState);
        this.registeredActionNames = [];
        this.dataListeners = {};
        this.actionListeners = {};
        this.debug = false;
    }

    state() {
        return this.currentStateMap.toJS();
    }

    get(key) {
        var pathArray = key.split('.');
        var value = this.currentStateMap.getIn(pathArray);
        if (typeof(value) == 'object' && typeof(value.toJS) == 'function')
            value = value.toJS();
        return value;
    }

    action(name, func) {
        var self = this;
        this.validateActionArguments(name, func);
        this.registeredActionNames.push(name);
        var newStateObject = this.currentStateMap.toJS();
        var newFunc = function() {
            if (self.debug)
                console.log(name, arguments);
            func.apply(this, arguments);
            var oldStateMap = self.currentStateMap;
            self.currentStateMap = Immutable.fromJS(newStateObject);
            self.executeDataListeners(oldStateMap, self.currentStateMap);
            self.executeActionListeners(name);
        };
        return newFunc.bind(newStateObject);
    }

    validateActionArguments(name, func) {
        if (!name || typeof(name) != 'string')
            throw Error('TrueStore.action: invalid argument "name".');
        if (!func || typeof(func) != 'function')
            throw Error('TrueStore.action: invalid argument "func".');
        if (this.registeredActionNames.indexOf(name) !== -1)
            throw Error('TrueStore.action: duplicate action name "' + name + '"');
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

    listenAction(name, callback) {
        this.actionListeners[name] = this.actionListeners[name] || [];
        this.actionListeners[name].push(callback);
    }

    unlistenAction(name, callback) {
        this.actionListeners[name] = this.actionListeners[name] || [];
        var index = this.actionListeners[name].indexOf(callback);
        if (index == -1)
            throw 'TrueStore.unlistenAction: action "' + name + '" is not registered.';
        this.actionListeners[name].splice(index, 1);
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

    executeActionListeners(actionName) {
        for (var name in this.actionListeners)
            this.actionListeners[name].map((callback) => {
                if (name == actionName)
                    callback();
            });
    }
}


module.exports = TrueStore;
