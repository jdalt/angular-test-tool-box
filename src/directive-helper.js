angular.module('jdalt.toolBox')
.factory('DirectiveHelper', function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper
) {

  function compileFn(tmpl, options) {

    options = (typeof options == 'boolean') ? { flushRequests: options } : options || {}

    return function compile(scopeParams, overrideOptions) {
      scopeParams = scopeParams || {}
      var scope = $rootScope.$new()

      angular.extend(scope, scopeParams)
      var callOptions = angular.extend({}, options, overrideOptions)

      var cloneAttachFn
      if (callOptions.attach) cloneAttachFn = function(clone) { clone.appendTo('body') }

      var el = $compile(tmpl)(scope, cloneAttachFn)
      scope.$digest()

      if (callOptions.flushRequests) $httpBackend.flush()

      return angular.extend({ scope: scope }, DomHelper(el))
    }

  }

  return {
    compileFn: compileFn
  }

})
