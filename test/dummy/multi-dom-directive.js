'use strict'

angular.module('dummy')
.directive('multiDomDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '\n<div id="main">\n' +
              '  <h2>Multi Dom Directive H2</h2>\n' +
              '  <button>Doppelganger</button>\n' +
              '  <button>Doppelganger</button>\n' +
              '  <ul id="thinger-list">\n' +
              '    <li>Thing 1</li>\n' +
              '    <li>Thing 2</li>\n' +
              '    <li>Thing 3</li>\n' +
              '  </ul>\n' +
              '  <input id="deep-thought-inp" type="text" ng-model="ctrl.allThought" />\n' +
              '  <div id="deep-thought-val">{{ ctrl.allThought }}</div>\n' +
              '</div>\n',
    controllerAs: 'ctrl',
    controller: function() {

      var vm = this
      vm.allThought = '42'

    }
  }
})

