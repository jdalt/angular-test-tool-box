'use strict'

angular.module('dummy')
.config(function(DSHttpAdapterProvider) {
  angular.extend(DSHttpAdapterProvider.defaults, {
    basePath: '/api',
    deserialize: function(req, resp) {
      return resp.data.result
    }
  })
})

angular.module('dummy')
.run(function(
  DS
) {

  DS.defineResource({
    name: 'cat',
    endpoint: '/mammals/cats'
  })

  DS.defineResource({
    name: 'monkey',
    endpoint: '/monkeys'
  })

})

angular.module('dummy')
.directive('jsDataDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '<div>' +
                '<div id="litter-box">{{ ctrl.catResult.name }}</div>' +
                '<button id="monkey-button" ng-click="ctrl.getMonkeys()"><button>' +
                '<ul>' +
                  '<li ng-repeat="monkey in ctrl.monkeyBunch">{{ monkey.name }}</li>' +
                '</ul>' +
              '</div>',
    controllerAs: 'ctrl',
    controller: function(
      DS
    ) {

      var vm = this

      DS.find('cat', 1).then(function(cat) {
        vm.catResult = cat
      })

      vm.getMonkeys = function() {
        DS.findAll('monkey', { bunch: 10 }).then(function(monkeys) {
          vm.monkeyBunch = monkey
        })
      }

    }
  }
})
