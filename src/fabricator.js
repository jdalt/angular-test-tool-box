angular.module('jdalt.toolBox')
.provider('Fabricator', function () {

  var fabDefinitions = {};

  var provider = {

    fab: function (name, obj) {
      fabDefinitions[name] = obj
      return provider
    },

    definitions: function() {
      return fabDefinitions
    },

    $get: function () {
      return function(name, override) {
        return angular.extend({}, fabDefinitions[name], override)
      }
    }
  }

  return provider

})
