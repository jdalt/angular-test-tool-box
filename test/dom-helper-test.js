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
      dom.click('#simp-button')
      expect(dom.findText('p')).toBe('Something Happened!')
    })

    it('should clickButton for button containing "Do A Thing" and cause "Something Happened!" result', function() {
      dom.clickButton('Do A Thing')
      expect(dom.findText('p')).toBe('Something Happened!')
    })

    it('should throw exception when clickButton not found', function() {
      expect(function() { dom.clickButton('Ghost Train') }).toThrow(new Error('<button>Ghost Train</button> not found'))
    })

    it('should proxy elment click" result', function() {
      dom.find('#simp-button').click()
      expect(dom.findText('p')).toBe('Something Happened!')
    })

    it('should return DomHelper in context of clicked element', function() {
      var buttonDom = dom.click('#simp-button')
      expect(buttonDom.element.tagName).toBe('BUTTON')
    })

    it('should throw an error when click(selector) unable to find selector element', function() {
      expect(function() { dom.click('#junk') }).toThrow(new Error('Element "#junk" not found to click'))
    })
  })

  describe('<multi-dom-directive>', function() {
    beforeEach(inject(function(DirectiveHelper) {
      dom = DirectiveHelper.compileFn('<div multi-dom-directive></div>', false)()
    }))

    it('should throw exception when clickButton finds two Doppelganger buttons', function() {
      expect(function() { dom.clickButton('Doppelganger') }).toThrow(new Error('More than one <button>Doppelganger</button> found'))
    })

    it('should findNthText items in #thinger-list', function() {
      expect(dom.findNthText('#thinger-list li', 0)).toBe('Thing 1')
      expect(dom.findNthText('#thinger-list li', 1)).toBe('Thing 2')
      expect(dom.findNthText('#thinger-list li', 2)).toBe('Thing 3')
    })

    it('should findNth items in #thinger-list', function() {
      expect(dom.findNth('#thinger-list li', 0).text()).toBe('Thing 1')
      expect(dom.findNth('#thinger-list li', 1).text()).toBe('Thing 2')
      expect(dom.findNth('#thinger-list li', 2).text()).toBe('Thing 3')
    })

    it('should count items in #thinger-list', function() {
      expect(dom.count('#thinger-list li')).toBe(3)
    })

    it('should throw exception when setInputValue selector is not found', function() {
      expect(function() { dom.setInputValue('#blah') }).toThrow(new Error('Element "#blah" not found to setInputValue'))
    })

    it('should setInputValue on input#deep-thought-inp', function() {
      expect(dom.findText('#deep-thought-val')).toBe('42')
      dom.setInputValue('#deep-thought-inp', 'Fun Fun Fun')
      expect(dom.findText('#deep-thought-val')).toBe('Fun Fun Fun')
    })

    it('should set input val() on input#deep-thought-inp', function() {
      expect(dom.findText('#deep-thought-val')).toBe('42')
      dom.find('#deep-thought-inp').val('Fun Fun Fun')
      expect(dom.findText('#deep-thought-val')).toBe('Fun Fun Fun')
    })
  })

})

