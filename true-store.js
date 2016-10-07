const Immutable = require('immutable');

class TrueStore {

    constructor(initialState) {
        this._state = Immutable.Map(initialState);
    }

    state() {
        return this._state.toObject();
    }
}

module.exports = TrueStore;
