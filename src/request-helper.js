angular.module('testUtil')
.factory('RequestHelper', function(
  $httpBackend
) {

  return {
    expectGet: function(path, result, params) {
      // var path = getPath(resourceName)
      // result needs to multiplex envelope, for DirectSports vs Sport Admin
      // dumbness
      $httpBackend.expectGET(path).respond(200, result) // consider need to format to result packet
    },
    whenGet: function(params) {
      $httpBackend.whenGET(path).respond(200, result) // consider need to format to result packet
    }
  }

})
