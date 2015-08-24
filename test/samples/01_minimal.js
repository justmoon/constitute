'use strict'

const expect = require('chai').expect

module.exports = function () {
  class B {}

  class A {
    static constitute () { return [ B ] }
    constructor (b) {
      this.b = b
    }
  }
  return { A, B }
}
