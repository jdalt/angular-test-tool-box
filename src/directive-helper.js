angular.module('jdalt.toolBox')
.factory('DirectiveHelper', function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper
) {

  function compileFn(tmpl, options) {

    options = (typeof options == 'boolean') ? { flushRequests: options } : options || {}

    return angular.extend(function compile(scopeParams, overrideOptions) {
      scopeParams = scopeParams || {}
      var scope = $rootScope.$new()

      angular.extend(scope, scopeParams)
      var callOptions = angular.extend({}, options, overrideOptions)

      var cloneAttachFn
      if (callOptions.attach) cloneAttachFn = function(clone) { clone.appendTo('body') }

      var el = $compile(callOptions.template || compile.template)(scope, cloneAttachFn)
      scope.$digest()

      if (callOptions.flushRequests) $httpBackend.flush()
      var innerScope = el.isolateScope()

      return angular.extend({
        scope: scope,
        innerScope: innerScope,
        ctrl: innerScope && (innerScope.$ctrl || innerScope.ctrl)
      }, DomHelper(el))
    }, {
      template: tmpl
    })

  }

  return {
    compileFn: compileFn
  }

})
