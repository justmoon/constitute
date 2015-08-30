'use strict'

class BaseResolver {
  constructor () {
  }
  static of (key) {
    return new this(key)
  }
}

module.exports = BaseResolver
