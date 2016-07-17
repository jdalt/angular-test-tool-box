'use strict';

angular.module('jdalt.toolBox', [])

angular.module('jdalt.toolBox')
.factory('DirectiveHelper', ["$compile", "$rootScope", "$httpBackend", "DomHelper", function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper
) {

  function compileFn(tmpl, flushRequests) {

    return function compile(scopeParams) {
      scopeParams = scopeParams || {}
      var scope = $rootScope.$new()

      angular.extend(scope, scopeParams)

      var el = $compile(tmpl)(scope)
      scope.$digest()

      if(flushRequests || flushRequests === undefined) $httpBackend.flush()

      return angular.extend({ scope: scope }, DomHelper(el))
    }

  }

  return {
    compileFn: compileFn
  }

}])

angular.module('jdalt.toolBox')
.factory('DomHelper', function(
) {

  function DomHelper(root) {
    return {
      el: root,
      clickButton: function(el) {
        var clickEl = root.find(el)

        if(!clickEl.length) {
          throw new Error('Element "'+ el +'" not found to click')
        }

        clickEl.click()
      },
      findText: function(el) {
        return root.find(el).text()
      },
      find: function(selector) { //TODO: test
        return DomHelper(root.find(selector))
      }
    }

  }

  return DomHelper

})

angular.module('jdalt.toolBox')
.provider('Fabricator', function () {

  var fabDefinitions = {};

  var provider = {

    fab: function (name, obj) {
      fabDefinitions[name] = obj
      return provider
    },

    definitions: function() {
      return fabDefinitions
    },

    $get: function () {
      return function(name, override) {
        var fabDef = fabDefinitions[name]

        if(!fabDef) {
          throw new Error('No fabricator definition for ' + name)
        }

        // Iteratively merge up chain of ancestors
        if(fabDef.$parent) {
          var current, previous, result
          previous = fabDef
          result = angular.merge({}, fabDef)
          while(previous.$parent) {
            current = fabDefinitions[previous.$parent]

            if(!current) {
              throw new Error('Parent fabricator ' + previous.$parent + ' not found for ' + name)
            }

            result = angular.merge({}, current, result) // use object literal {} to prevent mutation on fabricator definition
            previous = current
          }
          fabDef = result
        }

        return angular.merge({}, fabDef, override)
      }
    }
  }

  return provider

})

angular.module('jdalt.toolBox')
.factory('RequestHelper', ["$httpBackend", "$httpParamSerializer", "DSHttpAdapter", "DS", function(
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

}])
