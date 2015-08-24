# Constitute

> Minimalistic Dependency Injection (DI) for ES6

## Why Dependency Injection?

There are lots of good resources out there on Dependency Injection (DI) and Inversion of Control (IoC). For JavaScript developers, [Vojta Jina's ng-conf presentation](https://www.youtube.com/watch?v=_OGGsf1ZXMs) is a fantastic primer.

For many smaller apps, using plain ol' Node.js modules work just fine. But if you find yourself spending a lot of time wiring classes together with functions like this:

``` js
function main() {
  var electricity = new Electricity();
  var grinder = new Grinder(electricity);
  var heater = new Heater(electricity);
  var pump = new Pump(heater, electricity);
  var coffeeMaker = new CoffeeMaker(grinder, pump, heater);
  coffeeMaker.brew();
}
```

Then consider looking into Dependency Injection.

## Why this library?

Awesome Dependency Injection frameworks are on the way for JavaScript. Like the one in [Angular 2](http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html). But I wanted a module which is independent from any framework and works in vanilla ES6/Node.js without any transpiling.

## Installation

``` sh
npm install --save constitute
```

## Usage

Let's look at an example. For this README I'm going to use ES6 modules syntax. If you need CommonJS (`require`) style, please look in `example/cjs`.

Suppose we have three classes `A`, `B` and `C`. `A` depends on `B` and `C`. There are no other dependencies. We need to tell `constitute` that `A` depends on `B` and `C`. We also call the dependencies "constituents".

**A.js**
``` js
import B from './b'
import C from './c'

export default class A {
  static constitute () { return [ B, C ] }
  constructor (b, c) {
    this.b = b
    this.c = c
  }
}
```

The class `B` is defined without any special sugar.

**B.js**
``` js
export default class B {}
```

We'll skip `C` - you get the idea.

So how do we instantiate our annotated class `A`?

**main.js**
``` js
import constitute from '../../'
import A from './a'

// Instantiate a class
// Calling constitute() creates a new dependency injection context
const a = constitute(A)

console.log(a.constructor.name) // => A
console.log(a.b.constructor.name) // => B
console.log(a.c.constructor.name) // => C

// Simple.
```

And that's all you need to know to get started. The rest of the documentation below is there when you need it.

### Resolvers

When requesting dependencies, you can modify what kind of value is provided by using a *resolver*.

```js
import { Lazy } from 'constitute'

class D {
  static constitute () { return [ Lazy.of(A) ] }
  constructor (getA) {
    this.getA = getA
  }
}
```

There are different types of resolvers:

* `Instance` - The default resolver. Resolves the dependency immediately and provides it as the value
* `Lazy` - Provides a function which resolves the dependency when called, returning the value
* `All` - Provides an array of all values bound to the provided key (see *Binding* below)
* `Optional` - Injects an instance of a class only if it already exists in the container; null otherwise.

### Constitutors

You can also change how your dependencies are instantiated. There are two built-in policies:

* `Singleton` - The default. Your dependency is called with the `new` keyword and the resulting value is reused as a singleton within the same injection container.
* `Global` - Like a singleton, except the same instance is used even across containers. **Warning: Use of globals is generally discouraged. According to some, globals are ok for some very specific use cases, such as clocks and loggers.**
* `Transient` - Your dependency is called with the `new` keyword every time it is resolved.

To use a different constitutor, simply return it from the `constitute` method:

```js
import { Transient } from 'constitute'

class E {
  static constitute () { return Transient.with( [ A ] ) }
  constructor (a) {
    this.a = a
  }
}
```

### Binding

By default, classes resolve to a new instance of themselves. But what if we want to remap what they resolve to?

#### Binding for tests

Let's say we're testing and we to replace our `Database` service with a `MockDatabase` service. But first, here's our database service:

(In the interest of brevity, we'll skip imports for this example.)

**lib/database.js**
```js
class Database {
  static constitute () { return [ Config ] }
  constructor (config) {
    this.connection = config.get('db.uri')
  }
}
```

And our app itself:

**lib/app.js**
```js
class App {
  static constitute () { return [ Database ] }
  constructor (db) {
    this.db = db
  }
}
```

Here are our tests where we instantiate the app using a mock database:

**test/appSpec.js**
```js
describe('App', function () {
  beforeEach(function () {
    // Here is our mock database class
    class MockDatabase { ... }

    // First, let's get a fresh container
    this.container = new constitute.Container()

    // Then we tell it to bind the database to the mock database
    this.container.bind(Database, MockDatabase)

    // Finally we can instantiate the app
    this.app = this.container.constitute(App)

    // Simple.
  })

  // ...
})
```

The main difference you'll notice is that this time we used `new constitute.Container` and `Container#constitute()` instead of the short-hand `constitute()`. We also introduced the `Container#bind()` method, which takes a key as its first argument and a class or factory as its second argument.


### Factories

So far, we've only dealt with class dependencies. But classes (more specifically, class constructors) are actually just one type of factory in `constitute`.

* `Class(constructor, constitutor)` - This is the default factory. If you try to instantiate a non-factory value, `constitute` will try to wrap it in a `Class` factory. What this factory does is to try to gather the dependency and constitutor settings from a static method called `constitute`. The constitutor will resolve the dependencies and finally, the `Class` factory will call the constructor with the new keyword and the resolved dependencies as arguments.
* `Alias(key, constitutor)` - Links to another key on the same container. You can use `Alias` to specify another key and when it is asked to instantiate a value it will call that other factory instead.
* `Value(value)` - Doesn't instantiate anything, it simply returns the same value every time.
* `Clone(value, constitutor)` - Creates a clone of the provided value.
* `Factory(fn, constitutor)` - Allows you to specify a custom factory function.

#### `Class` factory

Normally, you never need to worry about the `Class` factory. Any classes you pass to `constitute` will automatically be wrapped in `Class` factories.

However, manually creating a Class factory allows you to pass in a constitutor. That can be useful, if you don't want to add a `constitute` method on the class itself.

In other words, this:

``` js
class A {
  static constitute () { return [ B ] }
  constructor (b) { ... }
}
```

Is the same as this:

``` js
import { Class } from 'constitute'

class ActualA {
  constructor (b) { ... }
}
const A = new Class(UnableToModify, [ B ])
```

Just make sure when you specify your dependencies to reference this Class as `A`, not as `ActualA`. Although you could of course bind `ActualA` to `A`:

``` js
myContainer.bind(ActualA, A)
```

After that, both `A` and `ActualA` would resolve to your `Class` factory with the correct dependencies.

#### `Alias` factory

The `Alias` factory can be used to cause a lookup for another key in the current container and use that key's factory instead.



#### `Value` factory

Possibly the most boring constructor. It always returns the same value. Because the value is static anyway it also doesn't need a constitutor. But you *can* still rebind it, alias it and so on.

``` js
import constitute, { Value, Container } from 'constitute'

const V = new Value(42)

class A {
  static constitute () { return [ V ] }
  constructor (v) {
    console.log('The answer is ' + v)
  }
}

constitute(A) // => The answer is 42

const container = new Container()
container.bind(V, new Value(undefined))
container.constitute(A) // => The answer is undefined
```

#### `Clone` factory

*TODO: Not yet implemented*

#### `Factory` ... factory?

With `Factory`, you can define your own factory function. Wield this power wisely.

``` js
import { Factory } from 'constitute'

class C { }

const B = new Factory(function (c) {
  return { c }
}, [ C ])

export default class A {
  static constitute () { return [ B ] }
  constructor (b) {
    this.b = b
  }
}

console.log(constitute(A).b.c instanceof C) // => true
```

## Acknowledgements

This library borrows heavily from the fantastic [DI component](https://github.com/aurelia/dependency-injection) in the [Aurelia framework](http://aurelia.io/). Awesome stuff.

Further inspiration comes from the [DI features](http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html) in [Angular 2](https://angularjs.org/).
