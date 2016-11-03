angular.module('jdalt.toolBox')
.factory('JsDataFabricator', function (
  Fabricator,
  $injector,
  baseResourceFinder
) {

  // We do this to avoid requiring Js-Data in the 'jdalt.toolBox' module
  if(!$injector.has('DS')) {
    throw new Error('JsDataFabricator requires JsData "DS" provider')
  }
  var DS = $injector.get('DS')

  function JsDataFabricator(fabName, params) {
    var fabObj = Fabricator(fabName, params)

    var resourceName = baseResourceFinder(fabName).name

    return DS.inject(resourceName, fabObj)
  }

  return JsDataFabricator

})
