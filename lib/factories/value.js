'use strict'

const NullFactory = require('./null')

class ValueFactory extends NullFactory {
  constructor (value) {
    super()

    this.value = value
  }

  instantiate () {
    return this.value
  }
}

module.exports = ValueFactory
