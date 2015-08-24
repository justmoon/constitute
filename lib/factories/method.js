'use strict'

const NullFactory = require('./null')

class MethodFactory extends NullFactory {
  constructor (fn) {
    super()

    this.instantiate = fn
  }
}

module.exports = MethodFactory
