const Immutable = require('immutable');


class Observer {

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


module.exports = Observer;
