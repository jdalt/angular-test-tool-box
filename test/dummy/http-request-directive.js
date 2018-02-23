'use strict'

angular.module('dummy')
.directive('httpRequestDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '<div>' +
                '<button id="radio-one" ng-click="ctrl.getRocket(\'#radio-one\')"><button>' +
                '<button id="radio-many" ng-click="ctrl.getRockets(\'#radio-many\')"><button>' +
                '<button id="radio-usa" ng-click="ctrl.getUsRockets(\'#radio-usa\')"><button>' +
                '<button id="launch-pad" ng-click="ctrl.postRocket(\'#launch-pad\')"><button>' +
                '<button id="deep-orbit" ng-click="ctrl.updateRocket(\'#deep-orbit\')"><button>' +
                '<button id="low-orbit" ng-click="ctrl.upsertRocket(\'#low-orbit\')"><button>' +
                '<button id="landing-zone" ng-click="ctrl.deleteRocket(\'#landing-zone\')"><button>' +
              '</div>',
    controllerAs: 'ctrl',
    controller: function(
      $element,
      $http
    ) {

      var vm = this

      function setText(id) {
        return function(resp) {
          $element.find(id).text(resp.data)
        }
      }

      vm.getRocket = function(id) {
        $http.get('/api/rocket/1').then(setText(id))
      }

      vm.getRockets = function(id) {
        $http.get('/api/rocket').then(setText(id))
      }

      vm.getUsRockets = function(id) {
        $http.get('/api/rocket?type=us').then(setText(id))
      }

      vm.postRocket = function(id) {
        $http.post('/api/rocket', { action: 'Create' }).then(setText(id))
      }

      vm.updateRocket = function(id) {
        $http.put('/api/rocket/1', { action: 'Update' }).then(setText(id))
      }

      vm.upsertRocket = function(id) {
        $http.patch('/api/rocket/1', { action: 'Upsert' }).then(setText(id))
      }

      vm.deleteRocket = function(id) {
        $http.delete('/api/rocket/1').then(setText(id))
      }

    }
  }
})
