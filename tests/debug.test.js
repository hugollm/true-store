const Store = require('true-store');

describe('debug', () => {

    it('enables operation logging for all stores when set to true', () => {
        global.console.debug = jest.fn();
        Store.debug(true);
        let store1 = new Store({foo: 1});
        let store2 = new Store({bar: 2});
        store1.observer(jest.fn());
        store2.observer(jest.fn());
        store1.set('foo', 3);
        store2.set('bar', 4);
        expect(global.console.debug.mock.calls.length).toBe(2);
    });

    it('can be disabled', () => {
        let store = new Store({foo: 1});
        store.observer(jest.fn());
        global.console.debug = jest.fn();
        Store.debug(true);
        store.set('foo', 2);
        expect(global.console.debug).toBeCalled();
        global.console.debug = jest.fn();
        Store.debug(false);
        store.set('foo', 3);
        expect(global.console.debug).not.toBeCalled();
    });

    it('logs triggered observers on specific keys', () => {
        global.console.debug = jest.fn();
        Store.debug(true);
        let store = new Store({foo: 1});
        store.observer(jest.fn(), ['foo']);
        store.set('foo', 2);
        expect(global.console.debug).toBeCalledWith('[store] observer triggered (foo)', store.get());
    });

    it('logs triggered observers on the whole store', () => {
        global.console.debug = jest.fn();
        Store.debug(true);
        let store = new Store({foo: 1});
        store.observer(jest.fn());
        store.set('foo', 2);
        expect(global.console.debug).toBeCalledWith('[store] observer triggered (*)', store.get());
    });

    it('logs a warning if an observer is triggered multiple times too fast', () => {
        global.console.warn = jest.fn();
        Store.debug(true);
        let store = new Store({foo: 1});
        store.observer(jest.fn());
        store.set('foo', 2);
        store.set('foo', 3);
        expect(global.console.warn).toBeCalledWith('[store] observer triggered multiple times too fast', store.get());
    });

    it('does not log a warning if an observer is triggered multiple not that fast', async () => {
        global.console.warn = jest.fn();
        Store.debug(true);
        let store = new Store({foo: 1});
        store.observer(jest.fn());
        store.set('foo', 2);
        await new Promise(resolve => {
            setTimeout(() => {
                store.set('foo', 3);
                resolve();
            }, 11);
        });
        expect(global.console.warn).not.toBeCalled();
    });
});
