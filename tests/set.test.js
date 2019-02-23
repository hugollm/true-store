const TrueStore = require('../src/true-store');

describe('set', () => {

    it('sets a variable in the state', () => {
        var store = new TrueStore({foo: null});
        store.set('foo', 'bar');
        expect(store.get('foo')).toBe('bar');
    });

    it('can set nested data', () => {
        var store = new TrueStore({foo: {bar: null}});
        store.set('foo.bar', 42);
        expect(store.get('foo.bar')).toBe(42);
    });

    it('can set nested data in previously set object', () => {
        var store = new TrueStore({foo: {bar: null}});
        store.set('foo.bar', {biz: 'fiz'});
        store.set('foo.bar.biz', 'fez');
        expect(store.get('foo.bar.biz')).toBe('fez');
    });

    it('triggers data listeners', () => {
        var store = new TrueStore({foo: null});
        callback = jest.fn();
        store.observer('foo', callback);
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('triggers data listeners from nested changes', () => {
        var store = new TrueStore({foo: {bar: null}});
        callback = jest.fn();
        store.observer('foo', callback);
        store.set('foo.bar', 42);
        expect(callback).toHaveBeenCalled();
    });

    it('throws error if called with invalid key', () => {
        var store = new TrueStore();
        expect(() => {
            store.set(42, true);
        }).toThrow('TrueStore.set: key must be string.');
    });

    it('creates object structure if unknown nested key is set', () => {
        var store = new TrueStore();
        store.set('foo.bar.biz', 42);
        expect(store.get('foo.bar.biz')).toBe(42);
        expect(store.get('foo')).toEqual({bar: {biz: 42}});
    });
});
