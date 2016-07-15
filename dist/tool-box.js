'use strict';

angular.module('testUtil', [])

angular.module('testUtil')
.factory('DirectiveHelper', function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper
) {

  function compileFn(tmpl, flushRequests) {

    return function compile(scopeParams) {
      var scope = $rootScope.$new()
      _.defaults(scope, scopeParams)

      var el = $compile(tmpl)(scope)
      scope.$digest()

      if(flushRequests || flushRequests === undefined) $httpBackend.flush()

      return DomHelper(el)
    }

  }

  return {
    compileFn: compileFn
  }

})

angular.module('testUtil')
.factory('DomHelper', function(
) {

  return function(root) {
    return {
      el: root,
      clickButton: function(el) {
        root.find(el).click()
      },
      findText: function(el) {
        return root.find(el).text()
      }
    }
  }

})

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
