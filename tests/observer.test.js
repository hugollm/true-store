const Store = require('../src/store');

describe('observer', () => {

    it('allows a callback to be called when something changes', () => {
        let store = new Store({foo: 42});
        let callback = jest.fn();
        store.observer(callback);
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('does not let observers be called when nothing changes', () => {
        let store = new Store({foo: 42});
        let callback = jest.fn();
        store.observer(callback);
        store.set('foo', 42);
        expect(callback).not.toHaveBeenCalled();
    });

    it('allows a callback to observe a specific key in the store', () => {
        let store = new Store({foo: 42, bar: 42});
        let callback = jest.fn();
        store.observer(callback, ['foo']);
        store.set('foo', 43);
        store.set('bar', 43);
        expect(callback.mock.calls.length).toBe(1);
    });

    it('allows a callback to observe multiple store keys', () => {
        let store = new Store({foo: 42, bar: 42, biz: 42});
        let callback = jest.fn();
        store.observer(callback, ['foo', 'bar']);
        store.set('foo', 43);
        store.set('bar', 43);
        store.set('biz', 43);
        expect(callback.mock.calls.length).toBe(2);
    });

    it('allows a callback to observe a nested key in the store', () => {
        let store = new Store({foo: {foo: 42, bar: 42}});
        let callback = jest.fn();
        store.observer(callback, ['foo.bar']);
        store.set('foo.foo', 43);
        store.set('foo.bar', 43);
        expect(callback.mock.calls.length).toBe(1);
    });

    it('allows an observer to be released', () => {
        let store = new Store({foo: 42});
        let callback = jest.fn();
        let observer = store.observer(callback);
        observer.release();
        store.set('foo', 'bar');
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not lose other observers when one is released', () => {
        let store = new Store({foo: 42});
        let callback1 = jest.fn();
        let callback2 = jest.fn();
        let observer1 = store.observer(callback1);
        let observer2 = store.observer(callback2);
        observer1.release();
        store.set('foo', 'bar');
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });

    it('throws exception if called with invalid key', () => {
        let store = new Store({foo: 42});
        expect(() => {
            store.observer(jest.fn(), 42);
        }).toThrow('Store.observer: keys must be an array of strings.');
    });

    it('throws exception if one of the keys is invalid', () => {
        let store = new Store({foo: 42});
        expect(() => {
            store.observer(jest.fn(), ['foo', 'bar', 42]);
        }).toThrow('Store.observer: keys must be an array of strings.');
    });

    it('throws exception if the keys argument is not an array', () => {
        let store = new Store({foo: 42});
        expect(() => {
            store.observer(jest.fn(), 'foo');
        }).toThrow('Store.observer: keys must be an array of strings.');
    });
});
