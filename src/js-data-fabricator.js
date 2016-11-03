angular.module('jdalt.toolBox')
.factory('JsDataFabricator', function (
  Fabricator,
  $injector
) {

  // We do this to avoid requiring Js-Data in the 'jdalt.toolBox' module
  if(!$injector.has('DS')) {
    throw new Error('JsDataFabricator requires JsData "DS" provider')
  }
  var DS = $injector.get('DS')

  function JsDataFabricator(resourceName, params) {
    var fabObj = Fabricator(resourceName, params)
    return DS.inject(resourceName, fabObj)
  }

  return JsDataFabricator

})
