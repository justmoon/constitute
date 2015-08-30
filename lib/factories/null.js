'use strict'

const Singleton = require('../constitutors/singleton')

class NullFactory {
  constructor (constitutor) {
    this.constitutor = this.createConstitutor(constitutor)
  }

  createInstance () {
    return null
  }

  getCacheKey () {
    return this
  }

  instantiate (container) {
    return this.constitutor.constitute(container, this.getCacheKey(), this.createInstance.bind(this, container))
  }

  getCachedInstance (container) {
    return this.constitutor.getCachedInstance(container, this.getCacheKey())
  }

  /**
   * Create a constitutor from the value the caller provided.
   *
   * When passed an array, we create a new Singleton constitutor using provided
   * array as the dependencies.
   *
   * When passed a function, we assume this function is the constitutor.
   *
   * When passed a falsy value, we create a default constitutor which is a
   * singleton with no dependencies.
   *
   * Otherwise, we assume something has gone horribly wrong and throw an Error.
   */
  createConstitutor (constitutor) {
    if (Array.isArray(constitutor)) {
      // Use default constitutor
      return Singleton.with(constitutor)
    } else if (constitutor instanceof Singleton) {
      return constitutor
    } else if (!constitutor) {
      return Singleton.with([])
    } else {
      throw new Error('Invalid constitutor of type ' + typeof constitutor)
    }
  }
}

module.exports = NullFactory
