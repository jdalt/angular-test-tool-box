angular.module('jdalt.toolBox')
.factory('DomHelper', function(
  $httpBackend
) {

  function DomHelper(root) {
    return {
      el: root,

      flush: $httpBackend.flush,

      clickButton: function(el) {
        var clickEl = root.find(el)

        if(!clickEl.length) {
          throw new Error('Element "'+ el +'" not found to click')
        }

        clickEl.click()

        return DomHelper(root)
      },

      findText: function(el) {
        return root.find(el).text()
      },

      find: function(selector) { //TODO: test
        return DomHelper(root.find(selector))
      }
    }

  }

  return DomHelper

})
