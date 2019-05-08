const Store = require('../src/store');

describe('get', () => {

    it('returns the entire state if called without arguments', () => {
        let store = new Store({foo: 42});
        let state = store.get();
        expect(state).toEqual({foo: 42});
    });

    it('can return a portion of the state', () => {
        let store = new Store({foo: 42});
        let foo = store.get('foo');
        expect(foo).toBe(42);
    });

    it('returns undefined if unknown key is requested', () => {
        let store = new Store({foo: 42});
        let bar = store.get('bar');
        expect(bar).toBe(undefined);
    });

    it('can return nested data', () => {
        let store = new Store({
            login: {
                loading: false,
                user: {id: 1, name: 'John'},
            }
        });
        let name = store.get('login.user.name');
        expect(name).toEqual('John');
    });

    it('can return null data', () => {
        let store = new Store({
            user: null,
        });
        let user = store.get('user');
        expect(user).toBeNull();
    });

    it('can return false data', () => {
        let store = new Store({
            logged: false,
        });
        let logged = store.get('logged');
        expect(logged === false).toBeTruthy();
    });

    it('can return undefined data', () => {
        let store = new Store({
            und: undefined,
        });
        let und = store.get('und');
        expect(und).toBeUndefined();
    });

    it('return plain objects from state', () => {
        let store = new Store({
            user: {id: 1, name: 'John'},
        });
        let user = store.get('user');
        expect(user).toEqual({id: 1, name: 'John'});
    });

    it('returns undefined for keys not present in the store', () => {
        let store = new Store();
        expect(store.get('und')).toBe(undefined);
    });

    it('returns undefined for nested keys not present in the store', () => {
        let store = new Store();
        expect(store.get('und.nest.nest')).toBe(undefined);
    });

    it('throws error if called with invalid key', () => {
        let store = new Store();
        expect(() => {
            store.get(42);
        }).toThrow('Store.get: key must be string.');
    });
});
