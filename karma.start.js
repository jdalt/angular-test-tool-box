'use strict'

beforeEach(function () {
  module('jdalt.toolBox')
  module('dummy')
})

afterEach(inject(function($httpBackend) {
  $httpBackend.verifyNoOutstandingExpectation()
  $httpBackend.verifyNoOutstandingRequest()
}))
