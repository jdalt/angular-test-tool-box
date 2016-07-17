'use strict'

angular.module('dummy')
.directive('multiDomDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '\n<div id="main">\n' +
              '  <h2>Multi Dom Directive H2</h2>\n' +
              '  <ul id="thinger-list">\n' +
              '    <li>Thing 1</li>\n' +
              '    <li>Thing 2</li>\n' +
              '    <li>Thing 3</li>\n' +
              '  </ul>\n' +
              '</div>\n',
    controllerAs: 'ctrl',
    controller: function() {

      var vm = this

    }
  }
})

