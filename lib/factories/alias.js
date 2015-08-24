'use strict'

const NullFactory = require('./null')
const Transient = require('../constitutors/transient')

class ClassFactory extends NullFactory {
  constructor (key, constitutor0) {
    super()

    this.key = key

    // Alias is unique in that it defaults to the transient constitutor
    const constitutor = constitutor0 || Transient.with([])

    this.constitutor = this.createConstitutor(constitutor)
  }

  instantiate (container) {
    const key = this.key
    return this.constitutor(container, this, function () {
      return container.constitute(key)
    })
  }
}

module.exports = ClassFactory
