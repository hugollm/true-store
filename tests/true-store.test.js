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
        store.listen('foo', callback);
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('triggers data listeners from nested changes', () => {
        var store = new TrueStore({foo: {bar: null}});
        callback = jest.fn();
        store.listen('foo', callback);
        store.set('foo.bar', 42);
        expect(callback).toHaveBeenCalled();
    });
});

describe('listen', () => {

    it('executes a callback when observed data changes', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        store.listen('foo', callback);
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('can execute two callbacks when observed data changes', () => {
        var store = new TrueStore({foo: 42});
        var callback1 = jest.fn();
        var callback2 = jest.fn();
        store.listen('foo', callback1);
        store.listen('foo', callback2);
        store.set('foo', 'bar');
        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });

    it('executes a callback when nested observed data changes', () => {
        var store = new TrueStore({
            database: {
                users: [{id: 1, name: 'John'}]
            }
        });
        var callback = jest.fn();
        store.listen('database.users', callback);
        store.set('database.users.0.name', 'Jane');
        expect(callback).toHaveBeenCalled();
    });

    it('does not execute the callback if unobserved data changes', () => {
        var store = new TrueStore({foo: 42, bar: 42});
        var callback = jest.fn();
        store.listen('bar', callback);
        store.set('foo', 43);
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not execute the callback if data changes to the same value', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        store.listen('foo', callback);
        store.set('foo', 42);
        expect(callback).not.toHaveBeenCalled();
    });
});

describe('unlisten', () => {

    it('prevents previously registered callback from executing', () => {
        var store = new TrueStore({foo: 42});
        var callback = jest.fn();
        store.listen('foo', callback);
        store.unlisten('foo', callback);
        store.set('foo', 'bar');
        expect(callback).not.toHaveBeenCalled();
    });

    it('throws an error if trying to unlisten an unregistered callback', () => {
        var store = new TrueStore();
        var callback = jest.fn();
        expect(() => {
            store.unlisten('foo', callback);
        }).toThrow();
    });

    it('throws an error if trying to unlisten a callback registered for other key', () => {
        var store = new TrueStore();
        var callback = jest.fn();
        store.listen('foo', callback);
        expect(() => {
            store.unlisten('bar', callback);
        }).toThrow();
    });
});
