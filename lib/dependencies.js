'use strict'

const Constitutor = require('./')

/**
 * Constitute decorator for classes.
 */
module.exports = function Dependencies (constitutor0) {
  let constitutor
  if (constitutor0 instanceof Constitutor) {
  } else {
    const dependencies = Array.prototype.slice.call(arguments)
    
  }
  return function (Class) {
    Class.constitute = dependencies
  }
}
