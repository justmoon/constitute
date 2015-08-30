'use strict'

const NullFactory = require('./null')

class MethodFactory extends NullFactory {
  constructor (fn, constitutor) {
    super(constitutor)

    this.fn = fn
  }

  createInstance (container, params) {
    return this.fn.apply(container, params)
  }
}

module.exports = MethodFactory
