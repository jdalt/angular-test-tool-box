describe('DomHelper', function() {

  var dom, compile

  describe('<simple-directive>', function() {
    beforeEach(inject(function(DirectiveHelper) {
      dom = DirectiveHelper.compileFn('<div simple-directive></div>', false)()
    }))

    it('should findText of "Simple Directive H1"', function() {
      expect(dom.findText('h1')).toBe('Simple Directive H1')
    })

    it('should chainably proxy "find()" and directly proxy "text()" on $el', function() {
      expect(dom.find('h1').text()).toEqual('Simple Directive H1')
    })

    it('should click "simp-button" and cause "Something Happened!" result', function() {
      dom.clickButton('#simp-button')
      expect(dom.findText('p')).toBe('Something Happened!')
    })

    it('should return DomHelper in context of clicked element', function() {
      var buttonDom = dom.clickButton('#simp-button')
      expect(buttonDom.element.tagName).toBe('BUTTON')
    })

    it('should throw an error when clickButton element cannot be found', function() {
      expect(function() { dom.clickButton('#junk') }).toThrow(new Error('Element "#junk" not found to click'))
    })
  })

  describe('<multi-dom-directive>', function() {
    beforeEach(inject(function(DirectiveHelper) {
      dom = DirectiveHelper.compileFn('<div multi-dom-directive></div>', false)()
    }))

    it('should findNthText items in #thinger-list', function() {
      expect(dom.findNthText('#thinger-list li', 0)).toBe('Thing 1')
      expect(dom.findNthText('#thinger-list li', 1)).toBe('Thing 2')
      expect(dom.findNthText('#thinger-list li', 2)).toBe('Thing 3')
    })
  })

})

