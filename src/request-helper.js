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

    expectMany: function(path, params, res) {
      var url = path + queryString(params)
      $httpBackend.expectGET(url).respond(200, res)
    },

    expectOne: function(path, id, res) {
      var url = path + '/' + id
      $httpBackend.expectGET(url).respond(200, res)
    },

    expectCreate: function(path, req, res) {
      var url = path
      $httpBackend.expectPOST(url, req).respond(200, res)
    },

    expectUpdate: function(path, id, req, res) {
      var url = path + '/' + id
      $httpBackend.expectPUT(url, req).respond(200, res)
    },

    expectUpsert: function(path, id, req, res) {
      var url = path + '/' + id
      $httpBackend.expectPATCH(url, req).respond(200, res)
    },

    expectDelete: function(path, id) {
      var url = path + '/' + id
      $httpBackend.expectDELETE(url).respond(204)
    },
  }

})
