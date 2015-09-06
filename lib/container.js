'use strict'

const Factory = require('./factories/base')
const NullFactory = require('./factories/null')
const AliasFactory = require('./factories/alias')
const ClassFactory = require('./factories/class')
const ValueFactory = require('./factories/value')
const MethodFactory = require('./factories/method')
const Singleton = require('./constitutors/singleton')

class Container {
  constructor () {
    this._factories = new Map()
    this._parent = null

    // Cache ourselves as the Container instance in our own cache
    Singleton.setCachedInstance(this, Container, this)
  }

  _getOrCreateEntry (key) {
    let entry = this._factories.get(key)
    if (!entry) {
      this._factories.set(key, entry = new Set())
    }
    return entry
  }

  bindNull (key) {
    return this.bindCustom(key, new NullFactory())
  }

  bindAlias (key, destinationKey) {
    return this.bindCustom(key, new AliasFactory(destinationKey))
  }

  bindClass (key, Class, constitutor) {
    return this.bindCustom(key, new ClassFactory(Class, constitutor))
  }

  bindValue (key, value) {
    return this.bindCustom(key, new ValueFactory(value))
  }

  bindMethod (key, fn, constitutor) {
    return this.bindCustom(key, new MethodFactory(fn, constitutor))
  }

  bindCustom (key, factory) {
    const entry = this._getOrCreateEntry(key)
    if (!(factory instanceof Factory)) {
      throw new Error('Container#bindCustom expects a Factory object')
    }
    entry.add(factory)
    entry.mostRecent = factory
    return this
  }

  findBestFactory (key) {
    const entry = this._factories.get(key)
    if (!entry && this._parent) {
      return this._parent.findBestFactory(key)
    }
    return entry ? entry.mostRecent : null
  }

  findAllFactories (key) {
    const parentEntries = this._parent ? this._parent.findAllFactories(key) : []

    const entry = this._factories.get(key)
    if (entry) {
      const array = parentEntries
      for (let v of entry) {
        array.push(v)
      }
      return array
    }

    return parentEntries
    // TODO With new ES6 array methods we can just do this
    // return entry ? Array.from(entry) : []
  }

  resolveFactory (key) {
    // First, try to find a local binding
    let binding = this.findBestFactory(key)

    if (binding) return binding

    // Next, try the parent container
    // TODO: Implement container hierarchy

    // Finally, default to the key itself
    if (key instanceof Factory) {
      // Nothing to do
      return key
    } else if (typeof key === 'function') {
      // Key is a function, we'll assume it's a class constructor
      return new ClassFactory(key)
    } else {
      throw new Error('Cannot constitute a value of type ' + typeof key)
    }
  }

  constitute (key) {
    const factory = this.resolveFactory(key)
    return factory.instantiate(this)
  }

  constituteAll (key) {
    const self = this
    let factories = this.findAllFactories(key)

    return factories.map(function (factory) {
      return factory.instantiate(self)
    })
  }

  getCachedInstance (key) {
    const factory = this.resolveFactory(key)
    return factory.getCachedInstance(this)
  }

  createChild () {
    const container = new Container()
    container._parent = this
    return container
  }
}

module.exports = Container
