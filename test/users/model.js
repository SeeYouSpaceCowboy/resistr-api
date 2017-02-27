const { describe, it, beforeEach, afterEach } = require('mocha')
const { assert } = require('chai')
const User = require('../../src/users/model')
const { truncate } = require('../helpers')

describe('users/model', () => {
  describe('validations', () => {
    it('validates name presence', () => {
      const user = new User({})
      let errors = user.validationErrors()

      assert.deepEqual(errors, {
        name: [ 'must be present' ]
      })
    })
  })
})
