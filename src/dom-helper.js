angular.module('jdalt.toolBox')
.factory('DomHelper', function(
  $httpBackend
) {

  function DomHelper(root) {

    var booleanInputs = 'input[type=checkbox], input[type=radio], option'

    function normalizeText(str) {
      if (typeof str !== 'string') throw new Error('normalizeWhitespace called with a non-string argument: ' + typeof str)
      return str.replace(/\s+/g, ' ').trim()
    }

    function getVal(input) {
      input = input.first()
      return input.is(booleanInputs) ? input.prop(input.is('option') ? 'selected' : 'checked') : input.val()
    }
    function setVal(input, value) {
      // input.focus() // triggers directive binding
      input.filter(booleanInputs).each(setBooleanInput)
      input.not(booleanInputs).val(value).triggerHandler('change')//.triggerHandler('blur')

      function setBooleanInput() {
        var $input = angular.element(this)
        var isOption = input.is('option')
        var prop = isOption ? 'selected' : 'checked'
        var $changer = isOption ? $input.parents('select') : $input

        var triggerChange = !!value !== $input.prop(prop)
        $input.prop(prop, !!value)                    // Force attribute state for $setViewValue
        if (!isOption) $input.triggerHandler('click') // Trigger click handler (will call $setViewValue)
        if (triggerChange) $changer.triggerHandler('change')
        // if (scope) scope.$digest() // just in case something is $watching
      }
    }

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

      triggerEvent: function(type, eventProps) {
        var ev = $.Event(type, eventProps)
        root.trigger(ev)
        return this
      },

      syntheticMouseEvent: function(type, x, y, overrideEl) {
        var el
        if(overrideEl) {
          el = overrideEl
        } else {
          el = root[0]
        }

        if(!x && !y) {
          x = y = 0
        }

        var ev = document.createEvent('MouseEvent')
        ev.initMouseEvent(
          type,
          true /* bubble */, true /* cancelable */,
          window, null,
          x, y, x, y, /* coordinates */
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

        setVal(inputEl, inputVal)
        return DomHelper(inputEl)
      },

      val: function(value) {
        if(arguments.length > 0) setVal(root, value)
        return getVal(root)
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

      text: function(selector, nth, options) {
        var el = root
        if(selector) el = root.find(selector)
        if(!options && nth && !angular.isNumber(nth)) options = nth
        if(nth != null && angular.isNumber(nth)) el = el.eq(nth)

        if(options && options.normalize === false) {
          return el.text()
        } else {
          return normalizeText(el.text())
        }
      },

      normalizeText: normalizeText

    }

  }

  return DomHelper

})
