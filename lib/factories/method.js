'use strict'

const NullFactory = require('./null')
const Singleton = require('../constitutors/singleton')

class MethodFactory extends NullFactory {
  constructor (fn, constitutor) {
    super()

    this.fn = fn
    this.constitutor = this.createConstitutor(constitutor)
  }

  instantiate (container) {
    return this.constitutor(container, this, this.fn)
  }
}

module.exports = MethodFactory
