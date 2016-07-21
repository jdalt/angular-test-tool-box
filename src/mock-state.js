angular.module('jdalt.toolBox')
.factory('mockState', function(
  $state,
  $rootScope
) {

  return function mockState(stateName, stateParams) {
    $state.go(stateName, stateParams)
    $rootScope.$apply()
  }

})
