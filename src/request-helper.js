angular.module('jdalt.toolBox')
.factory('RequestHelper', function(
  $httpBackend,
  $httpParamSerializer
) {

  function queryString(params) {
    var qs = ''

    if(params) {
      qs = $httpParamSerializer(params)
      if(qs != '') qs = '?' + qs
    }

    return qs
  }

  return {
    flush: $httpBackend.flush,
    expectMany: function(path, params, result) {
      var url = path + queryString(params)
      $httpBackend.expectGET(url).respond(200, result)
    },
    expectOne: function(path, id, result) {
      var url = path + '/' + id
      $httpBackend.expectGET(url).respond(200, result)
    }
  }

})
