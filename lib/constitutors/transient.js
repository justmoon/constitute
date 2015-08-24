'use strict'

const Singleton = require('./singleton')

class Transient extends Singleton {
  static getCachedInstance () {
    // Instances are never cached in this constitutor
    return null
  }

  static setCachedInstance () {
    // Instances are never cached in this constitutor
  }
}

module.exports = Transient
