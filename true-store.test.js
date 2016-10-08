const TrueStore = require('./true-store');


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

describe('state', () => {

    it('returns a copy of the state', () => {
        var store = new TrueStore({foo: 42});
        var state = store.state();
        expect(state.foo).toBe(42);
    });

    it('does not compute changes in the state copy', () => {
        var store = new TrueStore({foo: 42});
        var state1 = store.state();
        state1.foo = 45;
        var state2 = store.state();
        expect(state2.foo).toBe(42);
    });
});

describe('action', () => {

    it('creates a new function', () => {
        var store = new TrueStore();
        var actionFunction = function() {};
        var action = store.action('actionName', actionFunction);
        expect(action).toBeInstanceOf(Function);
        expect(action).not.toBe(actionFunction);
    });

    it('cannot be created without a name', () => {
        var store = new TrueStore();
        expect(() => {
            var action = store.action('', function() {});
        }).toThrow();
    });

    it('cannot be created without a function', () => {
        var store = new TrueStore();
        expect(() => {
            var action = store.action('actionName');
        }).toThrow();
    });

    it('cannot be created with arrow function', () => {
        var store = new TrueStore();
        expect(() => {
            var action = store.action('actionName', () => {});
        }).toThrow();
    });

    it('can change the store state', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(value) {
            this.foo = value;
        });
        action('bar');
        expect(store.state()).toEqual({foo: 'bar'});
    });
});
