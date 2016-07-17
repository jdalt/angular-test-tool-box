angular.module('jdalt.toolBox')
.factory('RequestHelper', function(
  $httpBackend,
  $httpParamSerializer,
  DSHttpAdapter, // TODO: configure with provider
  DS // TODO: configure with provider
) {

  // restBackend specific
  function getResource(resourceName) {
    return DS.definitions.filter(function(def) {
      return def.name == resourceName
    })
  }

  function getEndpoint(resourceName) {
    var resource = getResource(resourceName)
    if(!resource) throw new Error('Unable to find path for resource ' + resourceName)
    return resource.endpoint
  }

  // TODO: this needs to be injected/set by a provider to remove direct dep on JsData
  var basePath = DSHttpAdapter.defaults.basePath
  function resourcePath(resourceName) {
    return basePath + getEndpoint(resourceName)
  }

  // general request handling
  function queryString(params) {
    var qs = ''

    if(params) {
      qs = $httpParamSerializer(params)
      if(qs != '') qs = '?' + qs
    }

    return qs
  }

  function fullPath(def) {
    if(def[0] == '/') return def // it's a path

    return resourcePath(def)
  }

  function getUrlMany(def, params) {
    fullPath(def) + queryString(params)
  }

  function getUrlOne(def, id) {
    fullPath(def) + '/' + id
  }

  return {
    flush: $httpBackend.flush,

    expectMany: function(def, params, res) {
      var url = getUrlMany(def, params)
      $httpBackend.expectGET(url).respond(200, res)
    },

    expectOne: function(def, id, res) {
      var url = getUrlOne(def, id)
      $httpBackend.expectGET(url).respond(200, res)
    },

    expectCreate: function(def, req, res) {
      var url = getUrlMany(def)
      $httpBackend.expectPOST(url, req).respond(200, res)
    },

    expectUpdate: function(def, id, req, res) {
      var url = getUrlOne(def, id)
      $httpBackend.expectPUT(url, req).respond(200, res)
    },

    expectUpsert: function(def, id, req, res) {
      var url = getUrlOne(def, id)
      $httpBackend.expectPATCH(url, req).respond(200, res)
    },

    expectDelete: function(def, id) {
      var url = getUrlOne(def, id)
      $httpBackend.expectDELETE(url).respond(204)
    },
  }

})
