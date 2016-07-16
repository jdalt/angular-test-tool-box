'use strict'

angular.module('dummy')
.directive('simpleDirective', function() {
  return {
    restrict: 'A',
    scope: true,
    template: '<div id="simp-main">' +
              '  <h1>Simple Directive H1</h1>' +
              '  <div id="simp-sub">' +
              '    <button id="simp-button" ng-click="ctrl.doSomething()">Do A Thing</button>' +
              '    <p ng-if="ctrl.clickHappened">Something Happened!</p>' +
              '  </div>' +
              '</div>',
    controllerAs: 'ctrl',
    controller: function() {

      var vm = this

      vm.clickHappened = false

      vm.doSomething = function() {
        vm.clickHappened = true
      }

    }
  }
})

