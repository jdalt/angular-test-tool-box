'use strict'

beforeEach(function () {
  module('jdalt.toolBox')
  module('dummy')
})

// Turn off js-data logging to keep test reporter clear
beforeEach(module('dummy', function (DSHttpAdapterProvider) {
  angular.extend(DSHttpAdapterProvider.defaults, {
    log: false,
    error: false,
  })
}))

afterEach(inject(function($httpBackend) {
  $httpBackend.verifyNoOutstandingExpectation()
  $httpBackend.verifyNoOutstandingRequest()
}))
