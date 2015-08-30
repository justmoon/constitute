'use strict'

const BaseConstitutor = require('./base')
const BaseResolver = require('../resolvers/base')
const InstanceResolver = require('../resolvers/instance')

const INSTANCE_MAP = Symbol('constitute:instance_map')

class SingletonConstitutor extends BaseConstitutor {
  constructor (constituents) {
    super()
    this.constituents = constituents.map(function (constituent) {
      if (constituent instanceof BaseResolver) {
        return constituent
      }

      return InstanceResolver.of(constituent)
    })
  }

  static getInstanceCache (container) {
    if (!container[INSTANCE_MAP]) {
      container[INSTANCE_MAP] = new Map()
    }
    return container[INSTANCE_MAP]
  }

  static getCachedInstance (container, key) {
    return this.getInstanceCache(container).get(key)
  }

  static setCachedInstance (container, key, instance) {
    return this.getInstanceCache(container).set(key, instance)
  }

  static with (constituents) {
    return new this(constituents)
  }

  constitute (container, key, fn) {
    let instance = this.constructor.getCachedInstance(container, key)
    if (instance) {
      return instance
    }

    const params = this.constituents.map(function (constituent) {
      return constituent.resolve(container)
    })
    instance = Function.prototype.call.call(fn, null, params)

    this.constructor.setCachedInstance(container, key, instance)

    return instance
  }

  getCachedInstance (container, key) {
    return this.constructor.getCachedInstance(key, container)
  }
}

module.exports = SingletonConstitutor
