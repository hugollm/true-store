const Store = require('true-store');

describe('resetAll', () => {

    it('returns all stores to their initial state', () => {
        let store1 = new Store({foo: 1});
        let store2 = new Store({bar: 2});
        store1.set('foo',3);
        store2.set('bar', 4);
        Store.resetAll();
        expect(store1.get()).toEqual({foo: 1});
        expect(store2.get()).toEqual({bar: 2});
    });
});
