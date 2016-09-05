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
        root.each(function(index, el) {
          console.log('element', index, el)
        })
        return this
      },

      click: function(selector, nth) {
        if(!selector) { // proxy click on root
          root.click()
          return this
        }

        var clickEl = root.find(selector)
        if(!clickEl.length) {
          throw new Error('Element "'+ selector +'" not found to click')
        }
        if(nth != null) clickEl = clickEl.eq(nth)
        clickEl.click()

        return DomHelper(clickEl)
      },

      // Experimental, attempts to generate clicks when all else fails
      _clickHard: function(selector) {
        var el = root[0]
        if(selector) el = root.find(selector)[0]

        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
          "click",
          true /* bubble */, true /* cancelable */,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
        )
        el.dispatchEvent(ev)
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

      count: function(selector) {
        var el = root
        if(selector) el = root.find(selector)
        return el.length
      },

      find: function(selector, nth) {
        var el = root.find(selector)
        if(nth != null) el = el.eq(nth)
        return DomHelper(el)
      },

      text: function(selector, nth) {
        var el = root
        if(selector) el = root.find(selector)
        if(nth != null) el = el.eq(nth)
        return el.text()
      }

    }

  }

  return DomHelper

})
