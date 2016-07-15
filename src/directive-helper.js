angular.module('jdalt.toolBox')
.factory('DirectiveHelper', function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper
) {

  function compileFn(tmpl, flushRequests) {

    return function compile(scopeParams) {
      scopeParams = scopeParams || {}
      var scope = $rootScope.$new()

      Object.keys(scopeParams).forEach(function(key) {
        scope[key] = scopeParams[key]
      })

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
