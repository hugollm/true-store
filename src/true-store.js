const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        initialState = initialState || {};
        this.currentStateMap = Immutable.fromJS(initialState);
        this.nextStateObject = initialState;
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
        if (value !== null && typeof(value) == 'object' && typeof(value.toJS) == 'function')
            value = value.toJS();
        return value;
    }

    set(key, value) {
        var pathArray = key.split('.');
        var oldStateMap = this.currentStateMap;
        this.currentStateMap = this.currentStateMap.setIn(pathArray, Immutable.fromJS(value));
        this.executeDataListeners(oldStateMap, this.currentStateMap);
    }

    action(name, func) {
        var self = this;
        this.validateActionArguments(name, func);
        this.registeredActionNames.push(name);
        return function() {
            var args = self.argumentsToArray(arguments);
            if (self.debug)
                console.log(name, Immutable.fromJS(args).toJS());
            args.unshift(self.nextStateObject);
            func.apply(null, args);
            var oldStateMap = self.currentStateMap;
            self.currentStateMap = Immutable.fromJS(self.nextStateObject);
            self.executeDataListeners(oldStateMap, self.currentStateMap);
            self.executeActionListeners(name);
        };
    }

    argumentsToArray(args) {
        return args.length === 1 ? [args[0]] : Array.apply(null, args);
    }

    validateActionArguments(name, func) {
        if (!name || typeof(name) != 'string')
            throw Error('TrueStore.action: invalid argument "name".');
        if (!func || typeof(func) != 'function')
            throw Error('TrueStore.action: invalid argument "func".');
        if (this.registeredActionNames.indexOf(name) !== -1)
            throw Error('TrueStore.action: duplicate action name "' + name + '"');
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
