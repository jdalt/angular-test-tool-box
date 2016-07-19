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

      clickButton: function(buttonText) {
        var buttonEl = root.find('button:contains("' + buttonText + '")')

        if(buttonEl.length == 0) throw new Error('<button>' + buttonText + '</button> not found')
        if(buttonEl.length >= 2) throw new Error('More than one <button>' + buttonText + '</button> found')

        buttonEl.click()
        return DomHelper(buttonEl)
      },

      setInputValue: function(selector, inputVal) {
        var inputEl = root.find(selector)
        if(!inputEl.length) {
          throw new Error('Element "'+ selector +'" not found to setInputValue')
        }

        inputEl.val(inputVal).trigger('change')
        return DomHelper(inputEl)
      },

      val: function(value) {
        root.val(value).trigger('change')
        return this
      },

      cssClasses: function() {
        return root.prop('class')
      },

      hasClass: function(cssClass) {
        return root.hasClass(cssClass)
      },

      findText: function(selector) {
        return root.find(selector).text()
      },

      findNthText: function(selector, nth) {
        return root.find(selector).eq(nth).text()
      },

      count: function(selector) {
        return root.find(selector).length
      },

      find: function(selector) {
        return DomHelper(root.find(selector))
      },

      findNth: function(selector, nth) {
        return DomHelper(root.find(selector).eq(nth))
      },

      text: function() {
        return root.text()
      }

    }

  }

  return DomHelper

})
