'use strict'

const expect = require('chai').expect
const Container = require('../').Container
const ValueFactory = require('../').Value

describe('Container', function () {
  beforeEach(function () {
    this.container = new Container()
  })

  describe('findBestFactory', function () {
    it('should find a bound item', function () {
      const container = new Container()
      const symbol = Symbol()
      container.bindValue(Container, symbol)
      const value = container.findBestFactory(Container)

      expect(value).to.be.instanceOf(ValueFactory)
      expect(value.value).to.equal(symbol)
    })

    it('should find the most recently bound item', function () {
      const container = new Container()
      const symbol = Symbol()
      container.bindValue(Container, symbol)
      const symbol2 = Symbol()
      container.bindValue(Container, symbol2)
      const value = container.findBestFactory(Container)

      expect(value).to.be.instanceOf(ValueFactory)
      expect(value.value).to.equal(symbol2)
    })
  })

  describe('constitute', function () {
    beforeEach(function () {
      this.container = new Container()
      this.container2 = new Container()
    })

    it('should instantiate classes when called', function () {
      this.minimal = require('./samples/01_minimal')()
      const a = this.container.constitute(this.minimal.A)

      expect(a).to.be.instanceOf(this.minimal.A)
      expect(a.b).to.be.instanceOf(this.minimal.B)
    })

    it('should instantiate only one singleton when called twice', function () {
      this.minimal = require('./samples/01_minimal')()
      const a1 = this.container.constitute(this.minimal.A)
      const a2 = this.container.constitute(this.minimal.A)

      expect(a1).to.be.instanceOf(this.minimal.A)
      expect(a1.b).to.be.instanceOf(this.minimal.B)
      expect(a1).to.equal(a2)
      expect(a1.b).to.equal(a2.b)
    })

    it('should instantiate different singletons when called twice on different containers', function () {
      this.minimal = require('./samples/01_minimal')()
      const a1 = this.container.constitute(this.minimal.A)
      const a2 = this.container2.constitute(this.minimal.A)

      expect(a1).to.be.instanceOf(this.minimal.A)
      expect(a2).to.be.instanceOf(this.minimal.A)
      expect(a1.b).to.be.instanceOf(this.minimal.B)
      expect(a2.b).to.be.instanceOf(this.minimal.B)
      expect(a1).to.not.equal(a2)
      expect(a1.b).to.not.equal(a2.b)
    })

    it('should instantiate new instances of transient classes when called twice', function () {
      this.transient = require('./samples/02_transient')()
      const a1 = this.container.constitute(this.transient.A)
      const a2 = this.container.constitute(this.transient.A)

      expect(a1).to.be.instanceOf(this.transient.A)
      expect(a2).to.be.instanceOf(this.transient.A)
      expect(a1.b).to.be.instanceOf(this.transient.B)
      expect(a1.b).to.equal(a2.b)
    })

    it('should always use the same instance on global classes', function () {
      this.global = require('./samples/03_global')()
      const a1 = this.container.constitute(this.global.A)
      const a2 = this.container2.constitute(this.global.A)

      expect(a1).to.be.instanceOf(this.global.A)
      expect(a2).to.be.instanceOf(this.global.A)
      expect(a1).to.equal(a2)
      expect(a1.b).to.equal(a2.b)
    })

    it('should be able to resolve a value factory', function () {
      this.value = require('./samples/04_value')()
      const a = this.container.constitute(this.value.A)

      expect(a).to.be.instanceOf(this.value.A)
      expect(a.b).to.equal(42)
    })

    it('should follow aliases when using an alias factory', function () {
      this.alias = require('./samples/05_alias')()
      const a = this.container.constitute(this.alias.A)

      expect(a).to.be.instanceOf(this.alias.A)
      expect(a.b).to.be.instanceOf(this.alias.C)
    })

    it('should let you mock a class via binding', function () {
      class MockB {}

      const env = require('./samples/01_minimal')()
      this.container.bindClass(env.B, MockB)
      const a = this.container.constitute(env.A)

      expect(a).to.be.instanceOf(env.A)
      expect(a.b).to.be.instanceOf(MockB)
    })
  })
})
