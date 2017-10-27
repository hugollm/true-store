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

describe('get', () => {

    it('returns a portion of the state', () => {
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
        store.listenData('foo', callback);
        store.set('foo', 'bar');
        expect(callback).toHaveBeenCalled();
    });

    it('triggers data listeners from nested changes', () => {
        var store = new TrueStore({foo: {bar: null}});
        callback = jest.fn();
        store.listenData('foo', callback);
        store.set('foo.bar', 42);
        expect(callback).toHaveBeenCalled();
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

    it('can change the store state', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(state, value) {
            state.foo = value;
        });
        action('bar');
        expect(store.state()).toEqual({foo: 'bar'});
    });

    it('cannot register two actions with the same name', () => {
        var store = new TrueStore();
        store.action('fooAction', function() {});
        expect(() => {
            store.action('fooAction', function() {});
        }).toThrow();
    });

    it('works with arrow functions', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', (state, value) => {
            state.foo = value;
        });
        action('bar');
        expect(store.state()).toEqual({foo: 'bar'});
    });

    it('persists data changes through multiple actions', () => {
        var store = new TrueStore({foo: null, bar: null});
        var fooAction = store.action('fooAction', (state) => {
            state.foo = 'foo';
        });
        var barAction = store.action('barAction', (state) => {
            state.bar = 'bar';
        });
        fooAction();
        barAction();
        expect(store.state()).toEqual({foo: 'foo', bar: 'bar'});
    });

    it('persists data changes through chained/nested actions', () => {
        var store = new TrueStore({foo: null, bar: null});
        store.debug = true;
        var fooAction = store.action('fooAction', (state, name) => {
            state.foo = name;
            barAction('bar');
        });
        var barAction = store.action('barAction', (state, name) => {
            state.bar = name;
        });
        fooAction('foo');
        expect(store.state()).toEqual({foo: 'foo', bar: 'bar'});
    });
});

describe('listenData', () => {

    it('executes a callback when observed data changes', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(state) {
            state.foo = 'bar';
        });
        var callback = jest.fn();
        store.listenData('foo', callback);
        action();
        expect(callback).toHaveBeenCalled();
    });

    it('can execute two callbacks when observed data changes', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(state) {
            state.foo = 'bar';
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
        var action = store.action('fooAction', function(state) {
            state.database.users[0].name = 'Jane';
        });
        var callback = jest.fn();
        store.listenData('database.users', callback);
        action();
        expect(callback).toHaveBeenCalled();
    });

    it('does not execute the callback if nothing changes', () => {
        var store = new TrueStore();
        var action = store.action('fooAction', function() {});
        var callback = jest.fn();
        store.listenData('foo', callback);
        action();
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not execute the callback if unobserved data changes', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(state) {
            state.foo = 'bar';
        });
        var callback = jest.fn();
        store.listenData('bar', callback);
        action();
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not execute the callback if data changes to the same value', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(state) {
            state.foo = 42;
        });
        var callback = jest.fn();
        store.listenData('foo', callback);
        action();
        expect(callback).not.toHaveBeenCalled();
    });

    it('does not execute callback twice in chained actions', () => {
        var store = new TrueStore({foo: null});
        var fooAction = store.action('fooAction', function(state) {
            state.foo = 'foo';
            barAction();
        });
        var barAction = store.action('barAction', function(state) {
            state.foo = 'bar';
        });
        var callback = jest.fn();
        store.listenData('foo', callback);
        fooAction();
        expect(callback).toHaveBeenCalled();
        expect(callback.mock.calls.length).toEqual(1);
    });
});

describe('unlistenData', () => {

    it('prevents previously registered callback from executing', () => {
        var store = new TrueStore({foo: 42});
        var action = store.action('fooAction', function(state) {
            state.foo = 'bar';
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

describe('listenAction', () => {

    it('executes a callback when observed action gets executed', () => {
        var store = new TrueStore();
        var action = store.action('fooAction', function() {});
        var callback = jest.fn();
        store.listenAction('fooAction', callback);
        action();
        expect(callback).toHaveBeenCalled();
    });

    it('can execute two callbacks when observed action gets executed', () => {
        var store = new TrueStore();
        var action = store.action('fooAction', function() {});
        var callback1 = jest.fn();
        var callback2 = jest.fn();
        store.listenAction('fooAction', callback1);
        store.listenAction('fooAction', callback2);
        action();
        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });

    it('does not execute the callback when unobserved action gets executed', () => {
        var store = new TrueStore();
        var fooAction = store.action('fooAction', function() {});
        var barAction = store.action('barAction', function() {});
        var callback = jest.fn();
        store.listenAction('barAction', callback);
        fooAction();
        expect(callback).not.toHaveBeenCalled();
    });

    it('allow actions to be listened before declaration', () => {
        var store = new TrueStore();
        var callback = jest.fn();
        expect(() => {
            store.listenAction('fooAction', callback);
        }).not.toThrow();
    });
});

describe('unlistenAction', () => {

    it('prevents previously registered callback from executing', () => {
        var store = new TrueStore();
        var action = store.action('fooAction', function() {});
        var callback = jest.fn();
        store.listenAction('fooAction', callback);
        store.unlistenAction('fooAction', callback);
        action();
        expect(callback).not.toHaveBeenCalled();
    });

    it('throws an error if trying to unlisten an unregistered callback', () => {
        var store = new TrueStore();
        var action = store.action('fooAction', function() {});
        var callback = jest.fn();
        expect(() => {
            store.unlistenAction('fooAction', callback);
        }).toThrow();
    });

    it('throws an error if trying to unlisten a callback registered for other key', () => {
        var store = new TrueStore();
        var action = store.action('fooAction', function() {});
        var callback = jest.fn();
        store.listenAction('fooAction', callback);
        expect(() => {
            store.unlistenAction('barAction', callback);
        }).toThrow();
    });
});

describe('debug', () => {

    beforeEach(() => {
        console.originalLog = console.log;
        console.log = jest.fn();
    });

    afterEach(() => {
        console.log = console.originalLog;
    });

    it('logs the action names and arguments if turned on', () => {
        var store = new TrueStore();
        store.debug = true;
        var action = store.action('fooAction', function(state, bar) {});
        action('bar');
        expect(console.log).toHaveBeenCalled();
        expect(console.log.mock.calls.length).toBe(1);
        expect(console.log.mock.calls[0][0]).toBe('fooAction');
        expect(console.log.mock.calls[0][1]).toContain('bar');
    });

    it('does not log anything when turned off', () => {
        var store = new TrueStore();
        store.debug = false;
        var action = store.action('fooAction', function(bar) {});
        action('bar');
        expect(console.log).not.toHaveBeenCalled();
    });

    it('starts turned off', () => {
        var store = new TrueStore();
        expect(store.debug).toBe(false);
    });
});
