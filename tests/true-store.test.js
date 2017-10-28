const TrueStore = require('../src/true-store');

describe('constructor', () => {

    it('can be created without arguments', () => {
        var store = new TrueStore();
        expect(store).toBeInstanceOf(TrueStore);
    });

    it('can be created with an empty object', () => {
        var store = new TrueStore({});
        expect(store).toBeInstanceOf(TrueStore);
    });
});

describe('get', () => {

    it('returns the entire state if called without arguments', () => {
        var store = new TrueStore({foo: 42});
        var state = store.get();
        expect(state).toEqual({foo: 42});
    });

    it('can return a portion of the state', () => {
        var store = new TrueStore({foo: 42});
        var foo = store.get('foo');
        expect(foo).toBe(42);
    });

    it('returns undefined if unknown key is requested', () => {
        var store = new TrueStore({foo: 42});
        var bar = store.get('bar');
        expect(bar).toBe(undefined);
    });

    it('can return nested data', () => {
        var store = new TrueStore({
            login: {
                loading: false,
                user: {id: 1, name: 'John'},
            }
        });
        var name = store.get('login.user.name');
        expect(name).toEqual('John');
    });

    it('can return null data', () => {
        var store = new TrueStore({
            user: null,
        });
        var user = store.get('user');
        expect(user).toBeNull();
    });

    it('can return false data', () => {
        var store = new TrueStore({
            logged: false,
        });
        var logged = store.get('logged');
        expect(logged === false).toBeTruthy();
    });

    it('can return undefined data', () => {
        var store = new TrueStore({
            und: undefined,
        });
        var und = store.get('und');
        expect(und).toBeUndefined();
    });

    it('return plain objects from state', () => {
        var store = new TrueStore({
            user: {id: 1, name: 'John'},
        });
        var user = store.get('user');
        expect(user.name).toBe('John');
    });
});

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
        store.observer(callback, 'foo');
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('triggers data listeners from nested changes', () => {
        var store = new TrueStore({foo: {bar: null}});
        callback = jest.fn();
        store.observer(callback, 'foo');
        store.set('foo.bar', 42);
        expect(callback).toHaveBeenCalled();
    });
});

describe('transaction', () => {

    it('prevents listeners from running multiple times inside the transaction', () => {
        var store = new TrueStore({foo: 42});
        callback = jest.fn();
        store.observer(callback, 'foo');
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
        store.observer(callback, 'foo');
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

describe('observer', () => {

    it('allows a callback to be called when something changes', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        store.observer(callback);
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('does not let observers be called when nothing changes', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        store.observer(callback);
        store.set('foo', 42);
        expect(callback).not.toHaveBeenCalled();
    });

    it('allows a callback to observe a specific key in the store', () => {
        var store = new TrueStore({foo: 42, bar: 42});
        var callback = jest.fn();
        store.observer(callback, 'foo');
        store.set('foo', 43);
        store.set('bar', 43);
        expect(callback.mock.calls.length).toBe(1);
    });

    it('allows a callback to observe multiple store keys', () => {
        var store = new TrueStore({foo: 42, bar: 42, biz: 42});
        var callback = jest.fn();
        store.observer(callback, ['foo', 'bar']);
        store.set('foo', 43);
        store.set('bar', 43);
        store.set('biz', 43);
        expect(callback.mock.calls.length).toBe(2);
    });

    it('allows a callback to observe a nested key in the store', () => {
        var store = new TrueStore({foo: {foo: 42, bar: 42}});
        var callback = jest.fn();
        store.observer(callback, 'foo.bar');
        store.set('foo.foo', 43);
        store.set('foo.bar', 43);
        expect(callback.mock.calls.length).toBe(1);
    });

    it('allows an observer to be released', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        var observer = store.observer(callback);
        observer.release();
        store.set('foo', 'bar');
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not lose other observers when one is released', () => {
        var store = new TrueStore({foo: 42});
        var callback1 = jest.fn();
        var callback2 = jest.fn();
        var observer1 = store.observer(callback1);
        var observer2 = store.observer(callback2);
        observer1.release();
        store.set('foo', 'bar');
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
