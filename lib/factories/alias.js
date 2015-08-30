'use strict'

const NullFactory = require('./null')
const Transient = require('../constitutors/transient')

class ClassFactory extends NullFactory {
  constructor (key, constitutor0) {
    // Alias is unique in that it defaults to the transient constitutor
    const constitutor = constitutor0 || Transient.with([])

    super(constitutor)

    this.key = key
  }

  createInstance (container) {
    return container.constitute(this.key)
  }
}

module.exports = ClassFactory
