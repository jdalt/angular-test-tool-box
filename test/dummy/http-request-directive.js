'use strict'

angular.module('dummy')
.directive('httpRequestDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '<div>' +
                '<button id="radio-one" ng-click="ctrl.getRocket()"><button>' +
                '<button id="radio-many" ng-click="ctrl.getRockets()"><button>' +
                '<button id="radio-usa" ng-click="ctrl.getUsRockets()"><button>' +
                '<button id="launch-pad" ng-click="ctrl.postRocket()"><button>' +
                '<button id="deep-orbit" ng-click="ctrl.updateRocket()"><button>' +
                '<button id="low-orbit" ng-click="ctrl.upsertRocket()"><button>' +
                '<button id="landing-zone" ng-click="ctrl.deleteRocket()"><button>' +
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

      vm.postRocket = function() {
        $http.post('/api/rocket', { action: 'Create' })
      }

      vm.updateRocket = function() {
        $http.put('/api/rocket/1', { action: 'Update' })
      }

      vm.upsertRocket = function() {
        $http.patch('/api/rocket/1', { action: 'Upsert' })
      }

      vm.deleteRocket = function() {
        $http.delete('/api/rocket/1')
      }

    }
  }
})
