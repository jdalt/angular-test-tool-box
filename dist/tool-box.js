'use strict';

angular.module('jdalt.toolBox', [])

angular.module('jdalt.toolBox')
.factory('DirectiveHelper', ["$compile", "$rootScope", "$httpBackend", "DomHelper", "_", function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper,
  _
) {

  function compileFn(tmpl, flushRequests) {

    return function compile(scopeParams) {
      scopeParams = scopeParams || {}
      var scope = $rootScope.$new()

      _.extend(scope, scopeParams)

      var el = $compile(tmpl)(scope)
      scope.$digest()

      if(flushRequests || flushRequests === undefined) $httpBackend.flush()

      return _.extend({ scope: scope }, DomHelper(el))
    }

  }

  return {
    compileFn: compileFn
  }

}])

angular.module('jdalt.toolBox')
.factory('DomHelper', function(
) {

  return function(root) {
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
      }
    }
  }

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

angular.module('jdalt.toolBox')
.factory('_', ["$window", function(
  $window
) {
  return $window._
}])
