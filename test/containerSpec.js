'use strict'

const expect = require('chai').expect
const Container = require('../').Container
const ValueFactory = require('../').Value
const ClassFactory = require('../').Class

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

  describe('findAllFactories', function () {
    it('should find all factories in insertion order', function () {
      const container = new Container()
      class A {}
      const facA = new ValueFactory(10)
      const facB = new ValueFactory(20)
      container.bindCustom(A, facA)
      container.bindCustom(A, facB)

      const factories = container.findAllFactories(A)
      expect(factories).to.deep.equal([facA, facB])
    })

    it('should return an empty array if there are no factories', function () {
      class A {}
      const container = new Container()
      const factories = container.findAllFactories(A)
      expect(factories).to.be.instanceOf(Array)
      expect(factories).to.be.empty
    })
  })

  describe('constitute', function () {
    beforeEach(function () {
      this.container = new Container()
      this.container2 = new Container()
    })

    it('should instantiate classes when called', function () {
      this.env = require('./samples/01_minimal')()
      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.be.instanceOf(this.env.B)
    })

    it('should instantiate classes when called on classes with multiple dependencies', function () {
      this.env = require('./samples/08_multiple')()
      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.be.instanceOf(this.env.B)
      expect(a.c).to.be.instanceOf(this.env.C)
      expect(a.d).to.be.instanceOf(this.env.D)
      expect(a.c.e).to.be.instanceOf(this.env.E)
      expect(a.d.e).to.be.instanceOf(this.env.E)
      expect(a.d.f).to.be.instanceOf(this.env.F)
    })

    it('should instantiate only one singleton when called twice', function () {
      this.env = require('./samples/01_minimal')()
      const a1 = this.container.constitute(this.env.A)
      const a2 = this.container.constitute(this.env.A)

      expect(a1).to.be.instanceOf(this.env.A)
      expect(a1.b).to.be.instanceOf(this.env.B)
      expect(a1).to.equal(a2)
      expect(a1.b).to.equal(a2.b)
    })

    it('should instantiate different singletons when called twice on different containers', function () {
      this.env = require('./samples/01_minimal')()
      const a1 = this.container.constitute(this.env.A)
      const a2 = this.container2.constitute(this.env.A)

      expect(a1).to.be.instanceOf(this.env.A)
      expect(a2).to.be.instanceOf(this.env.A)
      expect(a1.b).to.be.instanceOf(this.env.B)
      expect(a2.b).to.be.instanceOf(this.env.B)
      expect(a1).to.not.equal(a2)
      expect(a1.b).to.not.equal(a2.b)
    })

    it('should instantiate new instances of transient classes when called twice', function () {
      this.env = require('./samples/02_transient')()
      const a1 = this.container.constitute(this.env.A)
      const a2 = this.container.constitute(this.env.A)

      expect(a1).to.not.equal(a2)
      expect(a1).to.be.instanceOf(this.env.A)
      expect(a2).to.be.instanceOf(this.env.A)
      expect(a1.b).to.be.instanceOf(this.env.B)
      expect(a1.b).to.equal(a2.b)
    })

    it('should always use the same instance on global classes', function () {
      this.env = require('./samples/03_global')()
      const a1 = this.container.constitute(this.env.A)
      const a2 = this.container2.constitute(this.env.A)

      expect(a1).to.be.instanceOf(this.env.A)
      expect(a2).to.be.instanceOf(this.env.A)
      expect(a1).to.equal(a2)
      expect(a1.b).to.equal(a2.b)
    })

    it('should be able to resolve a value factory', function () {
      this.env = require('./samples/04_value')()
      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.equal(42)
    })

    it('should follow aliases when using an alias factory', function () {
      this.env = require('./samples/05_alias')()
      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.be.instanceOf(this.env.C)
    })

    it('should return a copy of the data when using the clone factory', function () {
      this.env = require('./samples/06_clone')()

      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.deep.equal(this.env.data)
      expect(a.b).to.not.equal(this.env.data)
    })

    it('should return independent instances when using the clone factory', function () {
      this.env = require('./samples/06_clone')()

      const a1 = this.container.constitute(this.env.A)
      const a2 = this.container.constitute(this.env.A)

      a2.b.foo = 'baz'

      expect(a1.b).to.not.equal(a2.b)
      expect(a1).to.be.instanceOf(this.env.A)
      // Check against static data also in case we somehow modified the original object
      expect(a1.b).to.deep.equal({ foo: 'bar' })
      expect(a1.b).to.deep.equal(this.env.data)
      expect(a2).to.be.instanceOf(this.env.A)
      expect(a2.b).to.deep.equal({ foo: 'baz' })
    })

    it('should call factory method when using a method factory', function () {
      this.env = require('./samples/07_method')()
      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b.c).to.be.instanceOf(this.env.C)
    })

    it('should let you mock a class via binding', function () {
      class MockB {}

      const env = require('./samples/01_minimal')()
      this.container.bindClass(env.B, MockB)
      const a = this.container.constitute(env.A)

      expect(a).to.be.instanceOf(env.A)
      expect(a.b).to.be.instanceOf(MockB)
    })

    it('should instantiate all classes when using the All resolver', function () {
      this.env = require('./samples/09_plugin')()
      this.container.bindClass(this.env.Plugin, this.env.A)
      this.container.bindClass(this.env.Plugin, this.env.B)

      const app = this.container.constitute(this.env.App)

      expect(app).to.be.instanceOf(this.env.App)
      expect(app.plugins).to.have.length(2)
      expect(app.plugins[0]).to.be.instanceOf(this.env.A)
      expect(app.plugins[1]).to.be.instanceOf(this.env.B)
    })

    it('should create lazy resolver methods when using the Lazy resolver', function () {
      this.env = require('./samples/10_lazy')()

      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.be.a('function')
      expect(a.b()).to.be.instanceOf(this.env.B)
    })

    it('should return undefined for uncached instances when using the Optional resolver', function () {
      this.env = require('./samples/11_optional')()

      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.be.undefined
    })

    it('should return cached instances when using the Optional resolver', function () {
      this.env = require('./samples/11_optional')()

      this.container.constitute(this.env.B)
      const a = this.container.constitute(this.env.A)

      expect(a).to.be.instanceOf(this.env.A)
      expect(a.b).to.be.instanceOf(this.env.B)
    })
  })

  describe('bindNull', function () {
    beforeEach(function () {
      this.container = new Container()
    })

    it('should create a null factory', function () {
      class A {}
      this.container.bindNull(A)

      const a = this.container.constitute(A)
      expect(a).to.equal(null)
    })
  })

  describe('bindAlias', function () {
    beforeEach(function () {
      this.container = new Container()
    })

    it('should redirect a key to another key', function () {
      class A {}
      class B {}
      this.container.bindAlias(A, B)

      const a = this.container.constitute(A)
      expect(a).to.be.instanceOf(B)
    })

    it('should redirect through several levels', function () {
      class A {}
      class B {}
      class C {}
      this.container.bindAlias(A, B)
      this.container.bindAlias(B, C)

      const a = this.container.constitute(A)
      expect(a).to.be.instanceOf(C)
    })

    it('should follow remaps', function () {
      class A {}
      class B {}
      class C {}
      this.container.bindAlias(A, B)
      this.container.bindClass(B, C)

      const a = this.container.constitute(A)
      expect(a).to.be.instanceOf(C)
    })
  })

  describe('bindValue', function () {
    beforeEach(function () {
      this.container = new Container()
    })

    it('should create a value factory', function () {
      class A {}
      this.container.bindValue(A, 42)

      const a = this.container.constitute(A)
      expect(a).to.equal(42)
    })
  })

  describe('bindMethod', function () {
    beforeEach(function () {
      this.container = new Container()
    })

    it('should create a method factory', function () {
      class A {}
      class B {}
      this.container.bindMethod(A, function () {
        return new B()
      })

      const a = this.container.constitute(A)
      expect(a).to.be.instanceOf(B)
    })

    it('should throw when given an invalid constitutor', function () {
      class A {}
      class B {}

      const container = this.container
      expect(function () {
        container.bindMethod(A, function () {
          return new B()
        }, {})
      }).to.throw(/Invalid constitutor of type object/)
    })
  })

  describe('bindClass', function () {
    beforeEach(function () {
      this.container = new Container()
    })

    it('should create a class factory', function () {
      class A {}
      class B {}
      this.container.bindClass(A, B)

      const a = this.container.constitute(A)
      expect(a).to.be.instanceOf(B)
    })

    it('should throw when the class exports invalid metadata', function () {
      class A {}
      class B {
        static constitute () { return {} }
      }

      const container = this.container
      expect(function () {
        container.bindClass(A, B)
      }).to.throw(/The constitute annotation in class B returned an invalid value of type object \(should have been an array or a constitutor function\)/)
    })

    it('should throw when an anonymous class exports invalid metadata', function () {
      class A {}
      const B = function () {}
      B.constitute = function () { return {} }

      const container = this.container
      expect(function () {
        container.bindClass(A, B)
      }).to.throw(/The constitute annotation in class \[anonymous\] returned an invalid value of type object \(should have been an array or a constitutor function\)/)
    })
  })

  describe('bindCustom', function () {
    beforeEach(function () {
      this.container = new Container()
    })

    it('should use a custom factory', function () {
      class A {}

      let counter = 0
      class IncrementFactory extends ValueFactory {
        instantiate () {
          return counter++
        }
      }
      this.container.bindCustom(A, new IncrementFactory())

      const a1 = this.container.constitute(A)
      expect(a1).to.equal(0)

      const a2 = this.container.constitute(A)
      expect(a2).to.equal(1)
    })

    it('should throw when the factory is not a subclass of BaseFactory', function () {
      class A {}
      const container = this.container
      expect(function () {
        container.bindCustom(A, new A())
      }).to.throw(/Container#bindCustom expects a Factory object/)
    })
  })

  describe('resolveFactory', function () {
    beforeEach(function () {
      this.container = new Container()
    })

    it('should default to the key itself', function () {
      const fac = new ValueFactory(10)
      const a = this.container.resolveFactory(fac)
      expect(a).to.equal(fac)
    })

    it('should create a class factory automatically', function () {
      class A {}
      const a = this.container.resolveFactory(A)
      expect(a).to.be.instanceOf(ClassFactory)
    })

    it('should resolve to the most recent binding', function () {
      class A {}
      const facA = new ValueFactory(10)
      const facB = new ValueFactory(20)
      this.container.bindCustom(A, facA)
      this.container.bindCustom(A, facB)
      const a = this.container.resolveFactory(A)
      expect(a).to.equal(facB)
    })

    it('should throw when the key is undefined and invalid as a default', function () {
      const A = {}
      const container = this.container
      expect(function () {
        container.resolveFactory(A)
      }).to.throw(/Cannot constitute a value of type object/)
      this.container.resolveFactory
    })

    it('should not throw when the key is defined even when it is invalid as a default', function () {
      const A = {}
      this.container.bindNull(A)
      const a = this.container.resolveFactory(A)
      expect(a).to.be.a('object')
    })
  })
})
