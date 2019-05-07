const TrueStore = require('../src/true-store');

describe('resetAll', () => {

    it('returns all stores to their initial state', () => {
        let store1 = new TrueStore({foo: 1});
        let store2 = new TrueStore({bar: 2});
        store1.set('foo',3);
        store2.set('bar', 4);
        TrueStore.resetAll();
        expect(store1.get()).toEqual({foo: 1});
        expect(store2.get()).toEqual({bar: 2});
    });
});
