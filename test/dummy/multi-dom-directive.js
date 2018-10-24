'use strict'

angular.module('dummy')
.directive('multiDomDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '\n<div id="main">\n' +
              '  <h2>Multi Dom Directive H2</h2>\n' +
              '  <button>Doppelganger</button>\n' +
              '  <button id="button-2">Doppelganger</button>\n' +
              '  <ul id="thinger-list">\n' +
              '    <li>Thing 1</li>\n' +
              '    <li>Thing 2</li>\n' +
              '    <li>Thing 3</li>\n' +
              '  </ul>\n' +
              '  <input id="deep-thought-inp" type="text" ng-model="ctrl.allThought" />\n' +
              '  <input id="check-el" type="checkbox" ng-model="ctrl.checkVal" />\n' +
              '  <select id="sel-el" ng-model="ctrl.selVal" ng-options="val as key for (key, val) in ctrl.opts"><option value=""></option></select>\n' +
              '  <div id="deep-thought-val">{{ ctrl.allThought }}</div>\n' +
              '  <div id="check-val">{{ ctrl.checkVal }}</div>\n' +
              '  <div id="sel-val">{{ ctrl.selVal }}</div>\n' +
              '  <div id="french-yeoman" class="huguenot proletariat"></div>\n' +
              '</div>\n',
    controllerAs: 'ctrl',
    controller: function() {

      var vm = this
      vm.allThought = '42'
      vm.opts = {
        Rush: 'prog',
        Queen: 'rock',
        Kiss: 'glam'
      }

    }
  }
})

