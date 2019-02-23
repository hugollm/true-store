const TrueStore = require('../src/true-store');

describe('transaction', () => {

    it('prevents listeners from running multiple times inside the transaction', () => {
        var store = new TrueStore({foo: 42});
        callback = jest.fn();
        store.observer('foo', callback);
        store.transaction(() => {
            store.set('foo', 43);
            store.set('foo', 44);
            store.set('foo', 45);
        });
        expect(callback.mock.calls.length).toBe(1);
    });

    it('prevents listener calls inside nest transactions', () => {
        var store = new TrueStore({foo: 42});
        callback = jest.fn();
        store.observer('foo', callback);
        store.transaction(() => {
            store.set('foo', 43);
            store.transaction(() => {
                store.set('foo', 44);
                store.set('foo', 45);
            });
        });
        expect(callback.mock.calls.length).toBe(1);
    });
});
