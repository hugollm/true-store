const TrueStore = require('../src/true-store');

describe('constructor', () => {

    it('can be created without arguments', () => {
        let store = new TrueStore();
        expect(store).toBeInstanceOf(TrueStore);
    });

    it('can be created with an empty object', () => {
        let store = new TrueStore({});
        expect(store).toBeInstanceOf(TrueStore);
    });

    it('only accepts objects as the initial state', () => {
        expect(() => {
            let store = new TrueStore(42);
        }).toThrow('TrueStore: initial state must be an object.');
    });
});
