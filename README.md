# TrueStore

Dead simple state management for javascript applications.

[![npm version](https://badge.fury.io/js/true-store.svg)](https://badge.fury.io/js/true-store)
[![Build Status](https://travis-ci.org/hugollm/true-store.svg?branch=master)](https://travis-ci.org/hugollm/true-store)
[![Coverage Status](https://coveralls.io/repos/github/hugollm/true-store/badge.svg?branch=master)](https://coveralls.io/github/hugollm/true-store?branch=master)

![true story](https://s-media-cache-ak0.pinimg.com/236x/c7/3f/18/c73f18942a51478f34db359cdf6c9f91.jpg)


## Install

TrueStore is available on npm:

    npm install --save true-store


## Overview

TrueStore provides a simple store with observer capabilities. It also gives you copies of your state
when you ask for values, avoiding undesired mutation bugs.


`constructor`

```javascript
import TrueStore from 'true-store';

var store = new TrueStore(); // default state = {}
var store = new TrueStore({ initial: { state: 42 } });
```

`get`

```javascript
store.get(); // { initial: { state: 42 } }
store.get('initial'); // { state: 42 }
store.get('initial.state'); // 42
```

`set`

```javascript
store.set('initial', { state: 43 });
store.set('initial.state', 43);
store.set('users', []);
```

`observer`

```javascript
var observer1 = store.observer(() => {
    console.log('Any key changed!');
});

var observer2 = store.observer(() => {
    console.log('Initial state changed!');
}, 'initial.state');

var observer3 = store.observer(() => {
    console.log('One of the observed keys changed!');
}, ['some.key', 'some.other.key']);

observer3.release(); // won't be called anymore
```

`transaction`

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

To use TrueStore with React, you just need to:

* Get values from the store in your `render` method.
* Use an observer to tell the component to update when something changes.
* Release the observer when the component unmounts.

Example:

```javascript
class HelloUser extends React.Component {

    componentDidMount() {
        this.observer = store.observer(this.forceUpdate.bind(this));
    }

    componentWillUnmount() {
        this.observer.release();
    }

    render() {
        var name = store.get('user.name');
        return <div>Hello {name}</div>;
    }
}
```
