'use strict'

const Container = require('./lib/container')

module.exports = constitute

function constitute (Class) {
  const container = new Container()
  return container.constitute(Class)
}

// TODO Separate main exports from shorthand exports

// Constitutors
constitute.Global = require('./lib/constitutors/global')
constitute.Singleton = require('./lib/constitutors/singleton')
constitute.Transient = require('./lib/constitutors/transient')

// Factories
constitute.Null = require('./lib/factories/null')
constitute.Value = require('./lib/factories/value')
constitute.Alias = require('./lib/factories/alias')
constitute.Class = require('./lib/factories/class')
constitute.Method = require('./lib/factories/method')

// Resolvers
constitute.Instance = require('./lib/resolvers/instance')
constitute.All = require('./lib/resolvers/all')

// Other classes
constitute.Container = Container
