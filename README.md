# True Store

Simple state management for javascript applications.

If you are overwhelmed by flux/redux/etc, this library might be perfect for you. It is inspired by them, but with a VERY simplified API.

![true story](https://s-media-cache-ak0.pinimg.com/236x/c7/3f/18/c73f18942a51478f34db359cdf6c9f91.jpg)


## Quick introduction to state management

When building javascript applications, we often need some form of global state, accessible by many components. This need can be compared with that of a database in backend applications.

The problem with global state is that, if the changes are not controlled, it can spin out of control becoming unpredictable and dangerous. That's when state management comes in.

True Store limit state changes to named structures called "actions". Outside of an action, the state is only accessible for reading (it's a copy). It also give you the ability to listen to data changes and actions, making it rather easy to control the flux of your app.


## Overview

Note: for the sake of simplicity, the examples in this README uses jQuery for requests. You are free to use whatever you like.

Install the library:

    npm install true-store

Make an instance of the store with an initial state:

```javascript
const TrueStore = require('true-store');

var store = new TrueStore({
    login: {
        loading: false,
        user: null,
        error: null,
    }
});
```

Create some actions:

```javascript
const requestLogin = store.action('requestLogin', (state, email, password) => {
    state.login.loading = true;
    var request = $.post('/login', {email: email, password: password});
    request.done(loginOk);
    request.fail(loginError);
});

const loginOk = store.action('loginOk', (state, response) => {
    state.login.loading = false;
    state.login.user = response.user;
});

const loginError = store.action('loginError', (state, response) => {
    state.login.loading = false;
    state.login.error = response.error;
});
```

Listen to data changes or actions:

```javascript
store.listenData('login.loading', () => {
    var loading = store.get('login.loading');
    if (loading)
        console.log('spin the spinner...');
    else
        console.log('stop the spinner.');
});

store.listenAction('loginOk', () => {
    var user = store.get('login.user');
    console.log('Hello ' + user.name);
});
```

Execute the actions:

```javascript
requestLogin('john.doe@gmail.com', '123456');
```


## Integration with React

To use this library with React, you just need to:

* Read the states from the store in your `render` method
* Listen to changes from the store and tell the component to update

Example:

```javascript
class HelloUser extends React.Component {

    constructor() {
        super();
        this.update = this.forceUpdate.bind(this);
    }

    componentDidMount() {
        store.listenData('user.name', this.update);
    }

    componentWillUnmount() {
        store.unlistenData('user.name', this.update);
    }

    render() {
        var name = store.get('user.name');
        return <div>Hello {name}</div>;
    }
}
```

Note that you have to `unlistenData` before the component is unmounted. This is because, in React, calling a method from a component after it unmounts is an error.

Also note how the reference to the method used to update has to be the same in both `listenData` and `unlistenData` methods. That's why the binding to this is happening in the constructor.

You can make use of a base component to further simplify the process.


## Example

You can find a small example of the library in action here:

https://github.com/hugollm/true-store-example

It's just a simple login/logout example with some pages on a dashboard. Should be useful if you find yourself asking how this thing really works.
