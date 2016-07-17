'use strict'

angular.module('dummy')
.directive('httpRequestDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '<div>' +
                '<button id="launch-pad" ng-click="ctrl.postRocket()"><button>' +
                '<button id="deep-orbit" ng-click="ctrl.updateRocket()"><button>' +
                '<button id="low-orbit" ng-click="ctrl.upsertRocket()"><button>' +
                '<button id="landing-zone" ng-click="ctrl.deleteRocket()"><button>' +
                '<button id="radio-one" ng-click="ctrl.getRocket()"><button>' +
                '<button id="radio-many" ng-click="ctrl.getRockets()"><button>' +
                '<button id="radio-usa" ng-click="ctrl.getUsRockets()"><button>' +
              '</div>',
    controllerAs: 'ctrl',
    controller: function(
      $http
    ) {

      var vm = this

      vm.getRocket = function() {
        $http.get('/api/rocket/1')
      }

      vm.getRockets = function() {
        $http.get('/api/rocket')
      }

      vm.getUsRockets = function() {
        $http.get('/api/rocket?type=us')
      }

    }
  }
})
