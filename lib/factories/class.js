'use strict'

const NullFactory = require('./null')
const Singleton = require('../constitutors/singleton')

class ClassFactory extends NullFactory {
  constructor (Class, constitutor0) {
    super()

    this.Class = Class

    const constitutor = (typeof Class.constitute === 'function') ? Class.constitute() : Singleton.with([])

    if (!Array.isArray(constitutor) && typeof constitutor !== 'function') {
      throw new Error('The constitute annotation in class ' +
        (Class.name || '[anonymous]') + ' returned an invalid value ' +
        'of type ' + (typeof constitutor) + ' (should have been an ' +
        'array or a constitutor function)')
    }

    this.constitutor = this.createConstitutor(constitutor)
  }

  instantiate (container) {
    const Class = this.Class
    return this.constitutor(container, Class, function (params) {
      return new (Function.prototype.bind.apply(Class, [null].concat(params)))
    })
  }
}

module.exports = ClassFactory
