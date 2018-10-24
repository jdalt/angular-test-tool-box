'use strict'

angular.module('dummy-js-data')
.config(function(DSHttpAdapterProvider) {
  angular.extend(DSHttpAdapterProvider.defaults, {
    basePath: '/api',
    deserialize: function(req, resp) {
      return resp.data.result
    }
  })
})

angular.module('dummy-js-data')
.run(function(
  DS
) {

  DS.defineResource({
    name: 'cat',
    endpoint: '/mammals/cats'
  })

  DS.defineResource({
    name: 'monkey',
    endpoint: '/bed/monkeys',
    suffix: '.json'
  })

  DS.defineResource({
    name: 'org',
    endpoint: '/biz/orgs',
    computed: {
      synthetic: ['name', function(name) {
        return 'Robot ' + name
      }],
    },
    relations: {
      hasOne: {
        owner: {
          localField: 'owner',
          foreignKey: 'org_id'
        }
      }
    }
  })

  DS.defineResource({
    name: 'owner',
    endpoint: '/owners',
    relations: {
      belongsTo: {
        org: {
          parent: true,
          localField: 'org',
          localKey: 'org_id'
        }
      }
    }
  })

})

angular.module('dummy-js-data')
.directive('jsDataDirective', function() {
  return {
    restrict: 'A',
    scope: {},
    template: '<div>' +
                '<button id="catnip" ng-click="ctrl.getCat()"><button>' +
                '<div id="litter-box">{{ ctrl.catResult.name }}</div>' +
                '<button id="monkey-button" ng-click="ctrl.getMonkeys()"><button>' +
                '<ul>' +
                  '<li ng-repeat="monkey in ctrl.monkeyBunch">name: {{ monkey.name }} bananas: {{ monkey.bananas }}</li>' +
                '</ul>' +
                '<button id="cat-trap" ng-click="ctrl.destroyCat()"><button>' +
              '</div>',
    controllerAs: 'ctrl',
    controller: function(
      DS
    ) {

      var vm = this

      vm.getCat = function() {
        DS.find('cat', 1).then(function(cat) {
          vm.catResult = cat
        })
      }

      vm.getMonkeys = function() {
        DS.findAll('monkey', { bunch: 10 }).then(function(monkeys) {
          vm.monkeyBunch = monkeys
        })
      }

      vm.destroyCat = function() {
        DS.destroy('cat', 1)
      }

    }
  }
})
