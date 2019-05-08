const Store = require('../src/store');

describe('reset', () => {

    it('returns store to initial state', () => {
        let store = new Store({foo: 42, bar: {biz: 'foo'}});
        store.set('foo', 43);
        store.del('bar');
        store.reset();
        expect(store.get()).toEqual({foo: 42, bar: {biz: 'foo'}});
    });

    it('trigger observers while outside transactions', () => {
        let store = new Store({foo: 42});
        store.set('foo', 43);
        let callback = jest.fn();
        store.observer(callback, ['foo']);
        store.reset();
        expect(callback.mock.calls.length).toBe(1);
    });

    it('does not trigger observers if nothing changes', () => {
        let store = new Store({foo: 42});
        let callback = jest.fn();
        store.observer(callback, ['foo']);
        store.reset();
        expect(callback.mock.calls.length).toBe(0);
    });

    it('does not trigger observers inside transactions', () => {
        let store = new Store({foo: 42});
        store.set('foo', 43);
        let callback = jest.fn();
        store.observer(callback, ['foo']);
        store.transaction(() => {
            store.reset();
            expect(callback.mock.calls.length).toBe(0);
        });
        expect(callback.mock.calls.length).toBe(1);
    });
});
