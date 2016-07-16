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

        // Iteratively extend up chain of ancestors
        if(fabDef.$parent) {
          var current, previous, result
          previous = fabDef
          result = angular.extend({}, fabDef)
          while(previous.$parent) {
            current = fabDefinitions[previous.$parent]

            if(!current) {
              throw new Error('Parent fabricator ' + previous.$parent + ' not found for ' + name)
            }

            result = angular.extend({}, current, result) // use object literal {} to prevent mutation on fabricator definition
            previous = current
          }
          fabDef = result
        }

        return angular.extend({}, fabDef, override)
      }
    }
  }

  return provider

})

angular.module('jdalt.toolBox')
.factory('RequestHelper', ["$httpBackend", function(
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

}])
