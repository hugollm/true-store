const Immutable = require('immutable');


class Observer {

    constructor(store, keys, callback) {
        this.store = store;
        this.keys = keys;
        this.callback = callback;
        this.lastTrigger = null;
    }

    release() {
        let index = this.store.observers.indexOf(this);
        this.store.observers.splice(index, 1);
    }

    callIfNeeded(oldMap, newMap) {
        if (this.keys.length === 0 && !Immutable.is(oldMap, newMap))
            return this.trigger('*');
        for (let i in this.keys)
            if (this.stateKeyChanged(this.keys[i], oldMap, newMap))
                return this.trigger(this.keys[i]);
    }

    trigger(key) {
        if (this.store.inDebug()) {
            console.debug('[store] observer triggered (' + key + ')', this.store.get());
            this.detectMultipleCalls();
        }
        this.callback();
    }

    detectMultipleCalls() {
        let now = new Date();
        if (this.lastTrigger) {
            let msDiff = now - this.lastTrigger;
            if (msDiff <= 10)
                console.warn('[store] observer triggered multiple times too fast', this.store.get());
        }
        this.lastTrigger = now;
    }

    stateKeyChanged(key, oldMap, newMap) {
        let pathArray = key.split('.');
        let oldValue = oldMap.getIn(pathArray);
        let newValue = newMap.getIn(pathArray);
        return !Immutable.is(oldValue, newValue);
    }
}


module.exports = Observer;
