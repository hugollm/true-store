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

    it('returns an empty object if store was created without arguments', () => {
        var store = new TrueStore();
        expect(store.state()).toEqual({});
    });

    it('does not compute changes in the state copy', () => {
        var store = new TrueStore({foo: 42});
        var state1 = store.state();
        state1.foo = 45;
        var state2 = store.state();
        expect(state2.foo).toBe(42);
    });

    it('does not allow nested state values to be written outside actions', () => {
        var store = new TrueStore({
            users: [
                {id: 1, name: 'John'}
            ]
        });
        var state1 = store.state();
        state1.users[0].name = 'Jane';
        var state2 = store.state();
        expect(state2.users[0].name).toBe('John');
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

describe('listenData', () => {

    it('executes a callback when observed data changes', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function() {
            this.foo = 'bar';
        });
        var callback = jest.fn();
        store.listenData('foo', callback);
        action();
        expect(callback).toHaveBeenCalled();
    });

    it('can execute two callbacks when observed data changes', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function() {
            this.foo = 'bar';
        });
        var callback1 = jest.fn();
        var callback2 = jest.fn();
        store.listenData('foo', callback1);
        store.listenData('foo', callback2);
        action();
        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });

    it('executes a callback when nested observed data changes', () => {
        var store = new TrueStore({
            database: {
                users: [{id: 1, name: 'John'}]
            }
        });
        var action = store.action('fooAction', function() {
            this.database.users[0].name = 'Jane';
        });
        var callback = jest.fn();
        store.listenData('database.users', callback);
        action();
        expect(callback).toHaveBeenCalled();
    });

    it('does not execute the callback if nothing changes', () => {
        var store = new TrueStore();
        var action = store.action('fooAction', function(value) {});
        var callback = jest.fn();
        store.listenData('foo', callback);
        action();
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not execute the callback if unobserved data changes', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(value) {
            this.foo = value;
        });
        var callback = jest.fn();
        store.listenData('bar', callback);
        action('bar');
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not execute the callback if data changes to the same value', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function() {
            this.foo = 42;
        });
        var callback = jest.fn();
        store.listenData('foo', callback);
        action();
        expect(callback).not.toHaveBeenCalled();
    });
});

describe('unlistenData', () => {

    it('prevents previously registered callback from executing', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function() {
            this.foo = 'bar';
        });
        var callback = jest.fn();
        store.listenData('foo', callback);
        store.unlistenData('foo', callback);
        action();
        expect(callback).not.toHaveBeenCalled();
    });

    it('throws an error if trying to unlisten an unregistered callback', () => {
        var store = new TrueStore();
        var callback = jest.fn();
        expect(() => {
            store.unlistenData('foo', callback);
        }).toThrow();
    });

    it('throws an error if trying to unlisten a callback registered for other key', () => {
        var store = new TrueStore();
        var callback = jest.fn();
        store.listenData('foo', callback);
        expect(() => {
            store.unlistenData('bar', callback);
        }).toThrow();
    });
});
