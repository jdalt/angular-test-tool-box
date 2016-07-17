angular.module('jdalt.toolBox')
.factory('DomHelper', function(
  $httpBackend
) {

  function DomHelper(root) {
    return {
      $el: root, // jQuery wrapped element

      element: root[0], // first or only plain dom object

      flush: $httpBackend.flush,

      log: function() {
        console.log('element', this.element)
      },

      clickButton: function(selector) {
        var clickEl = root.find(selector)

        if(!clickEl.length) {
          throw new Error('Element "'+ selector +'" not found to click')
        }

        clickEl.click()

        return DomHelper(clickEl) // TODO test chain
      },

      findText: function(selector) {
        return root.find(selector).text()
      },

      findNthText: function(selector, nth) { // TODO: test
        return root.find(selector).eq(nth).text()
      },

      find: function(selector) { //TODO: test
        return DomHelper(root.find(selector))
      },

      text: function() { //TODO: test
        return root.text()
      }

    }

  }

  return DomHelper

})
