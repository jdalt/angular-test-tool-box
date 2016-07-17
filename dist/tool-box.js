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
.factory('DomHelper', ["$httpBackend", function(
  $httpBackend
) {

  function DomHelper(root) {
    return {
      $el: root, // jQuery wrapped element

      element: root[0], // first or only plain dom object

      flush: $httpBackend.flush,

      log: function() {
        console.log('element', this.element)
      },

      clickButton: function(selector) {
        var clickEl = root.find(selector)

        if(!clickEl.length) {
          throw new Error('Element "'+ selector +'" not found to click')
        }

        clickEl.click()

        return DomHelper(clickEl) // TODO test chain
      },

      findText: function(selector) {
        return root.find(selector).text()
      },

      findNthText: function(selector, nth) { // TODO: test
        return root.find(selector).eq(nth).text()
      },

      find: function(selector) { //TODO: test
        return DomHelper(root.find(selector))
      },

      text: function() { //TODO: test
        return root.text()
      }

    }

  }

  return DomHelper

}])

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
.factory('RequestHelper', ["$httpBackend", "$httpParamSerializer", "Fabricator", "DSHttpAdapter", "DS", function(
  $httpBackend,
  $httpParamSerializer,
  Fabricator,
  DSHttpAdapter, // TODO: configure with provider
  DS // TODO: configure with provider
) {

  // restBackend specific
  function getEndpoint(resourceName) {
    var resource = DS.definitions[resourceName]
    if(!resource) throw new Error('Unable to find path for resource ' + resourceName)
    return resource.endpoint
  }

  // TODO: this needs to be injected/set by a provider to remove direct dep on JsData
  var basePath = DSHttpAdapter.defaults.basePath
  function resourcePath(resourceName) {
    return basePath + getEndpoint(resourceName)
  }

  function responseTransformer(data) {
    return { result: data }
  }

  function defaultResponseTransformer(data) {
    return data
  }

  function fabricated(def, props) {
    if(isPath(def)) return props
    var fabObj = Fabricator(def, props)
    return responseTransformer(fabObj)
  }

  function manyFabricated(def, props) {
    if(isPath(def)) return props

    var fabObjs = []
    props.forEach(function(propObj) {
      fabObjs.push(Fabricator(def, propObj))
    })

    return responseTransformer(fabObjs)
  }

  function checkArray(def, props) {
    if(!isPath(def) && !angular.isArray(props)) {
      throw new Error('Response must be an array') // possible to override for custom envelope?
    }
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

  function isPath(def) {
    return def[0] == '/'
  }

  function fullPath(def) {
    if(isPath(def)) return def

    return resourcePath(def)
  }

  function getUrlMany(def, params) {
    return fullPath(def) + queryString(params)
  }

  function getUrlOne(def, id) {
    return fullPath(def) + '/' + id
  }

  return {
    flush: $httpBackend.flush,

    expectMany: function(def, params, res) {
      checkArray(def, res)
      var url = getUrlMany(def, params)
      $httpBackend.expectGET(url).respond(200, manyFabricated(def, res))
    },

    expectOne: function(def, id, res) {
      var url = getUrlOne(def, id)
      $httpBackend.expectGET(url).respond(200, fabricated(def,res))
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
