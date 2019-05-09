# TrueStore

Dead simple state management on top of [Immutable.js](https://immutable-js.github.io/immutable-js/).

[![npm version](https://badge.fury.io/js/true-store.svg)](https://badge.fury.io/js/true-store)
[![Build Status](https://travis-ci.org/hugollm/true-store.svg?branch=master)](https://travis-ci.org/hugollm/true-store)
[![Coverage Status](https://coveralls.io/repos/github/hugollm/true-store/badge.svg?branch=master)](https://coveralls.io/github/hugollm/true-store?branch=master)

![true story](https://s-media-cache-ak0.pinimg.com/236x/c7/3f/18/c73f18942a51478f34db359cdf6c9f91.jpg)


## Install

TrueStore is available on npm:

    npm install true-store


## Overview

TrueStore provides a simple store with observer capabilities. It also gives you copies of your state
when you ask for values, avoiding undesired mutation bugs.

Why you might wanna use it:

- **Simplicity:** simple `get` and `set` interface. No weird magic going on.
- **Control:** Thanks to the explicit observers, you always know when your code will update.
- **Performance:** Since updates are in your control, if you do it right it will be fast. If you do it wrong, you can fix it. Also, thanks to Immutable.js the observers don't need to run if data updates but is equal to the previous value.
- **Predictability:** Thanks to Immutable.js you won't run into weird mutation bugs. Your data only updates when you call methods like `set` and `merge`. When reading you'll get copies of your data to do as you please.


### constructor

```javascript
import Store from 'true-store';

let store = new Store(); // default state = {}
let store = new Store({
    user: { name: 'John Doe' },
});
```

### get

```javascript
store.get(); // { user: {name: 'John Doe'} }
store.get('user'); // {name: 'John Doe'}
store.get('user.name'); // 'John Doe'
```

### set

```javascript
store.set('user', { name: 'Jane' });
store.set('user.name', 'Jane');
store.set('messages', []);
```

### merge

```javascript
store.merge({ user: { age: 42 } }); // { user: { name: 'John Doe', age: 42 }}
store.merge({ messages: ['hello world'] });
```

### observer

```javascript
function somethingChanged() {}
function userChanged() {}
function userOrMessagesChanged() {}

store.observer(somethingChanged);
store.observer(userChanged, ['user']);
store.observer(userOrMessagesChanged, ['user', 'messages']);

let observer = store.observer(somethingChanged);
observer.release(); // observer won't run after release
```

### transaction

```javascript
// observers will be called only once, after the transaction ends
store.transaction(() => {
    store.set('a', 1);
    store.set('b', 2);
    store.set('c', 3);
});

// transactions can be nested, only the root will trigger observers
store.transaction(() => {
    store.set('a', 1);
    store.set('b', 2);
    store.transaction(() => {
        store.set('c', 3);
        store.set('d', 4);
    });
});
```


## Integration with React

TrueStore works anywhere. If you wanna use it with React, you just need to:

* Get values from the store and use at will, usually in your `render` method.
* Use an observer to tell the component to update when something changes.
* Release the observer when the component unmounts.


### Example

#### store.js
```javascript
import Store from 'true-store';

export default new Store({
    count: 0,
});
```

#### actions.js
```javascript
import store from './store';

export function increment() {
    let count = store.get('count');
    store.set('count', count + 1);
}
```

#### counter.js
```javascript
import React from 'react';

import store from './store';
import { increment } from './actions';


class Counter extends React.Component {

    componentDidMount() {
        this.observer = store.observer(this.forceUpdate.bind(this));
    }

    componentWillUnmount() {
        this.observer.release();
    }

    render() {
        return <button onClick={increment}>
            {store.get('count')}
        </button>;
    }
}
```
