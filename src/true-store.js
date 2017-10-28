const Immutable = require('immutable');


class TrueStore {

    constructor(initialState) {
        this.currentStateMap = Immutable.fromJS(initialState || {});
        this.dataListeners = {};
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
