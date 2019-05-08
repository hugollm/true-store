const Store = require('../src/store');

describe('del', () => {

    it('deletes a key from the store', () => {
        let store = new Store({foo: 42});
        store.del('foo');
        expect(store.get('foo')).toBe(undefined);
    });

    it('can delete nested keys from an object', () => {
        let store = new Store({foo: {bar: 42}});
        store.del('foo.bar');
        expect(store.get()).toEqual({foo: {}});
    });

    it('can delete index from a nested list', () => {
        let store = new Store({foo: {bar: ['a', 'b', 'c']}});
        store.del('foo.bar.1');
        expect(store.get()).toEqual({foo: {bar: ['a', 'c']}});
    });

    it('only accepts strings as key argument', () => {
        let store = new Store({foo: 'bar'});
        expect(() => {
            store.del(42);
        }).toThrow('Store.del: key must be string.');
    });

    it('trigger observers while outside transactions', () => {
        let store = new Store({foo: 42});
        let callback = jest.fn();
        store.observer(callback, ['foo']);
        store.del('foo');
        expect(callback.mock.calls.length).toBe(1);
    });

    it('does not trigger observers inside a transaction', () => {
        let store = new Store({foo: 42});
        let callback = jest.fn();
        store.observer(callback, ['foo']);
        store.transaction(() => {
            store.del('foo');
            expect(callback.mock.calls.length).toBe(0);
        });
        expect(callback.mock.calls.length).toBe(1);
    });
});
