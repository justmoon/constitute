'use strict'

const INSTANCE_MAP = Symbol('constitute:instance_map')

class Singleton {
  static getInstanceCache (container) {
    if (!container[INSTANCE_MAP]) {
      container[INSTANCE_MAP] = new Map()
    }
    return container[INSTANCE_MAP]
  }

  static getCachedInstance (key, container) {
    return this.getInstanceCache(container).get(key)
  }

  static setCachedInstance (key, instance, container) {
    return this.getInstanceCache(container).set(key, instance)
  }

  static with (constituents) {
    const Self = this
    return function (container, key, fn) {
      let instance = Self.getCachedInstance(key, container)
      if (instance) {
        return instance
      }

      const params = constituents.map(container.constitute.bind(container))
      instance = Function.prototype.apply.call(fn, this, params)

      Self.setCachedInstance(key, instance, container)

      return instance
    }
  }
}

module.exports = Singleton
