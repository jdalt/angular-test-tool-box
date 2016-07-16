'use strict'

angular.module('jdalt.toolBox')
.directive('bidirectionalDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    bindToController: {
      twoWay: '='
    },
    template: '<div id="main">{{ ctrl.twoWay }}</div>',
    controllerAs: 'ctrl',
    controller: function() {
      var vm = this
    }
  }
})

