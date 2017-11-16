const TrueStore = require('../src/true-store');

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
        expect(user).toEqual({id: 1, name: 'John'});
    });

    it('returns undefined for keys not present in the store', () => {
        var store = new TrueStore();
        expect(store.get('und')).toBe(undefined);
    });

    it('returns undefined for nested keys not present in the store', () => {
        var store = new TrueStore();
        expect(store.get('und.nest.nest')).toBe(undefined);
    });

    it('throws error if called with invalid key', () => {
        var store = new TrueStore();
        expect(() => {
            store.get(42);
        }).toThrow('TrueStore.get: key must be string.');
    });
});
