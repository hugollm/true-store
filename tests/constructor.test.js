const Store = require('true-store');

describe('constructor', () => {

    it('can be created without arguments', () => {
        let store = new Store();
        expect(store).toBeInstanceOf(Store);
    });

    it('can be created with an empty object', () => {
        let store = new Store({});
        expect(store).toBeInstanceOf(Store);
    });

    it('only accepts objects as the initial state', () => {
        expect(() => {
            let store = new Store(42);
        }).toThrow('Store: initial state must be an object.');
    });
});
