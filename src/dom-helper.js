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

      click: function(selector) {
        if(!selector) { // proxy click on root
          root.click()
          return this
        }

        var clickEl = root.find(selector)
        if(!clickEl.length) {
          throw new Error('Element "'+ selector +'" not found to click')
        }
        clickEl.click()

        return DomHelper(clickEl)
      },

      findText: function(selector) {
        return root.find(selector).text()
      },

      findNthText: function(selector, nth) {
        return root.find(selector).eq(nth).text()
      },

      find: function(selector) {
        return DomHelper(root.find(selector))
      },

      text: function() {
        return root.text()
      }

    }

  }

  return DomHelper

})
