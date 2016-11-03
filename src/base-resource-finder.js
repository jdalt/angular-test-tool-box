angular.module('jdalt.toolBox')
.factory('baseResourceFinder', function (
  Fabricator,
  $injector
) {

  // We do this to avoid requiring Js-Data in the 'jdalt.toolBox' module
  function getDS() {
    if(!$injector.has('DS')) {
      throw new Error('baseResourceFinder requires JsData "DS" provider')
    }
    return $injector.get('DS')
  }

  // Recursively climbs tree of Fabricators via $parent and then retrieves resource definition for base parent.
  function baseResourceFinder(def) {
    var DS = getDS()

    var fab = Fabricator(def)
    var resourceName = def

    if(!fab || !resourceName) throw new Error('Unable to find path for resource ' + def)

    while(fab.$parent) {
      resourceName = fab.$parent
      fab = Fabricator(resourceName)
    }

    return DS.definitions[resourceName]
  }

  return baseResourceFinder

})
