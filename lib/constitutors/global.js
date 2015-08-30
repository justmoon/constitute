'use strict'

const Singleton = require('./singleton')

class Global extends Singleton {
  static getCachedInstance (container, Class) {
    return Global._instances.get(Class)
  }

  static setCachedInstance (container, Class, instance) {
    return Global._instances.set(Class, instance)
  }
}

Global._instances = new Map()

module.exports = Global
