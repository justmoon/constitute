'use strict'

const Singleton = require('../constitutors/singleton')

class NullFactory {
  instantiate () {
    return null
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
    } else if (typeof constitutor === 'function') {
      return constitutor
    } else if (!constitutor) {
      return Singleton.with([])
    } else {
      throw new Error('Invalid constitutor of type ' + typeof constitutor)
    }
  }
}

module.exports = NullFactory
