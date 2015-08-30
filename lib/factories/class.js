'use strict'

const NullFactory = require('./null')
const Constitutor = require('../constitutors/base')
const Singleton = require('../constitutors/singleton')

class ClassFactory extends NullFactory {
  constructor (Class, constitutor0) {
    const constitutor = (typeof Class.constitute === 'function') ? Class.constitute() : Singleton.with([])

    if (!Array.isArray(constitutor) && !(constitutor instanceof Constitutor)) {
      throw new Error('The constitute annotation in class ' +
        (Class.name || '[anonymous]') + ' returned an invalid value ' +
        'of type ' + (typeof constitutor) + ' (should have been an ' +
        'array or a constitutor function)')
    }

    super(constitutor)

    this.Class = Class
  }

  createInstance (container, params) {
    // Provide the dependencies to the constructor
    return new (Function.prototype.bind.apply(this.Class, [null].concat(params)))
  }

  getCacheKey () {
    // Classes are cached per class (even if there are multiple factories for the same class)
    return this.Class
  }
}

module.exports = ClassFactory
