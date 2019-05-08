const Store = require('../src/store');

describe('transaction', () => {

    it('prevents listeners from running multiple times inside the transaction', () => {
        let store = new Store({foo: 42});
        callback = jest.fn();
        store.observer(callback, ['foo']);
        store.transaction(() => {
            store.set('foo', 43);
            store.set('foo', 44);
            store.set('foo', 45);
        });
        expect(callback.mock.calls.length).toBe(1);
    });

    it('prevents listener calls inside nest transactions', () => {
        let store = new Store({foo: 42});
        callback = jest.fn();
        store.observer(callback, ['foo']);
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
