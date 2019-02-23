const TrueStore = require('../src/true-store');

describe('observer', () => {

    it('allows a callback to be called when something changes', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        store.observer(null, callback);
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('does not let observers be called when nothing changes', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        store.observer(null, callback);
        store.set('foo', 42);
        expect(callback).not.toHaveBeenCalled();
    });

    it('allows a callback to observe a specific key in the store', () => {
        var store = new TrueStore({foo: 42, bar: 42});
        var callback = jest.fn();
        store.observer('foo', callback);
        store.set('foo', 43);
        store.set('bar', 43);
        expect(callback.mock.calls.length).toBe(1);
    });

    it('allows a callback to observe multiple store keys', () => {
        var store = new TrueStore({foo: 42, bar: 42, biz: 42});
        var callback = jest.fn();
        store.observer(['foo', 'bar'], callback);
        store.set('foo', 43);
        store.set('bar', 43);
        store.set('biz', 43);
        expect(callback.mock.calls.length).toBe(2);
    });

    it('allows a callback to observe a nested key in the store', () => {
        var store = new TrueStore({foo: {foo: 42, bar: 42}});
        var callback = jest.fn();
        store.observer('foo.bar', callback);
        store.set('foo.foo', 43);
        store.set('foo.bar', 43);
        expect(callback.mock.calls.length).toBe(1);
    });

    it('allows an observer to be released', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        var observer = store.observer(null, callback);
        observer.release();
        store.set('foo', 'bar');
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not lose other observers when one is released', () => {
        var store = new TrueStore({foo: 42});
        var callback1 = jest.fn();
        var callback2 = jest.fn();
        var observer1 = store.observer(null, callback1);
        var observer2 = store.observer(null, callback2);
        observer1.release();
        store.set('foo', 'bar');
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });

    it('throws exception if called with invalid key', () => {
        var store = new TrueStore({foo: 42});
        expect(() => {
            store.observer(42, jest.fn());
        }).toThrow('TrueStore.observer: keys must be strings.');
    });

    it('throws exception if one of the keys is invalid', () => {
        var store = new TrueStore({foo: 42});
        expect(() => {
            store.observer(['foo', 'bar', 42], jest.fn());
        }).toThrow('TrueStore.observer: keys must be strings.');
    });
});
