const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        initialState = initialState || {};
        this.currentState = Immutable.fromJS(initialState);
    }

    state() {
        return this.currentState.toJS();
    }

    action(name, func) {
        var self = this;
        this.validateActionArguments(name, func);
        var newStateObject = this.currentState.toJS();
        var newFunc = function() {
            func.apply(this, arguments);
            self.currentState = Immutable.fromJS(newStateObject);;
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
}


module.exports = TrueStore;
