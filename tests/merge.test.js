const Store = require('true-store');

describe('merge', () => {

    it('merges object with the current state', () => {
        let store = new Store({foo: 1});
        store.merge({bar: 2});
        expect(store.get()).toEqual({foo: 1, bar: 2});
    });

    it('merges can correctly merge nested objects', () => {
        let store = new Store({a: {aa: 1, ab: 2}});
        store.merge({a: {ab: 3}, b: 4});
        expect(store.get()).toEqual({a: {aa: 1, ab: 3}, b: 4});
    });

    it('triggers data listeners', () => {
        let store = new Store({foo: 1});
        callback = jest.fn();
        store.observer(callback);
        store.merge({foo: 2});
        expect(callback).toHaveBeenCalled();
    });

    it('triggers data listeners for new keys', () => {
        let store = new Store({foo: 1});
        callback = jest.fn();
        store.observer(callback);
        store.merge({bar: 2});
        expect(callback).toHaveBeenCalled();
    });

    it('it respects transactions', () => {
        let store = new Store({foo: 1});
        callback = jest.fn();
        store.observer(callback);
        store.transaction(() => {
            store.merge({foo: 2});
            store.merge({foo: 3});
            store.merge({foo: 4});
        });
        expect(callback.mock.calls.length).toBe(1);
    });

    it('can only be called with an object as argument', () => {
        let store = new Store();
        expect(() => {
            store.merge(42);
        }).toThrow('Store.merge: state can only merge with an object.');
    });
});
