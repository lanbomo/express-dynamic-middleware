# express-dynamic-middleware
To add, remove dynamic middleware in runtime for express.

## Install

```bash
npm install express-dynamic-middleware
```

## Usage

```js
const express = require('express');

// import express-dynamic-middleware
const dynamicMiddleware = require('express-dynamic-middleware');


// create auth middleware
const auth = function(req, res, next) {
    if (req.get('Authorization') === 'Basic') {
        next();
    } else {
        res.status(401).end('Unauthorization');
    }
};

// create dynamic middleware
const dynamic = dynamicMiddleware.create(auth);

// create express app
const app = express();

// use the dynamic middleware
app.use(dynamic.handle());

// unuse auth middleware
dynamic.unuse(auth);
```

## API

### dynamicMiddleware.create([middlewares])


```js
const dynamic = dynamicMiddleware.create(middlewares);
```


Use `create` to create dynamic middleware `dynamic`, the argument `middlewares` cloud be a middleware function like `function(req, res, next){}` or a middleware functions array like `[function(req, res, next){}, function(req, res, next){}`;

### dynamic

`dynamic` is created by `dynamicMiddleware.create`, it has some functions to manage the middlewares.

#### use

```js
dynamic.use(function(req, res, next) {
    // do something
});
```

To call `use` function to add middleware in runtime.

#### unuse

```js
const auth = function(req, res, next) {
    if (req.get('Authorization') === 'Basic') {
        next();
    } else {
        res.status(401).end('Unauthorization');
    }
};

// use auth middleware
dynamic.use(auth);

// remove the auth middleware
dynamic.unuse(auth);
```

To call `unuse` function to remove the middleware.

#### clean

```js
const dynamic = dynamicMiddleware.create([function(){}, function(){}]);

// clean the dynamic middlewares
dynamic.clean();
```

To call `clean` function to remove all the middlewares

#### handle

```js
const app = express();

// return the dynamic middlewares to the express app
app.use(dynamic.handle());
```

To call `handle` function to get the dynamic middleware function to the express app

#### get

```js
const dynamic = dynamicMiddleware.create([function(){}, function(){}]);

console.log(dynamic.get()); // [function(){}, function(){}]
console.log(dynamic.get().length); // 2

dynamic.use(function() {});

console.log(dynamic.get().length); // 3

dynamic.clean();

console.log(dynamic.get()); // []
console.log(dynamic.get().length); // 0
```

To call `get` function to get the dynamic middleware stack.