describe('DomHelper', function() {

  var dom, compile

  describe('<simple-directive>', function() {
    beforeEach(inject(function(DirectiveHelper) {
      dom = DirectiveHelper.compileFn('<div simple-directive></div>', false)()
    }))

    it('should find text() of "Simple Directive H1"', function() {
      expect(dom.text('h1')).toBe('Simple Directive H1')
    })

    it('should chainably proxy "find()" and directly proxy "text()" on $el', function() {
      expect(dom.find('h1').text()).toEqual('Simple Directive H1')
    })

    it('should click "simp-button" and cause "Something Happened!" result', function() {
      dom.click('#simp-button')
      expect(dom.text('p')).toBe('Something Happened!')
    })

    it('should clickButton for button containing "Do A Thing" and cause "Something Happened!" result', function() {
      dom.clickButton('Do A Thing')
      expect(dom.text('p')).toBe('Something Happened!')
    })

    it('should throw exception when clickButton not found', function() {
      expect(function() { dom.clickButton('Ghost Train') }).toThrow(new Error('<button>Ghost Train</button> not found'))
    })

    it('should proxy elment click" result', function() {
      dom.find('#simp-button').click()
      expect(dom.text('p')).toBe('Something Happened!')
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

    it('should return 2nd button element when ".click" is passed an array index as 2nd arg', function() {
      var buttonDom = dom.click('button', 1)
      expect(buttonDom.element.id).toBe('button-2')
    })

    it('should find nth text() items in #thinger-list', function() {
      expect(dom.text('#thinger-list li', 0)).toBe('Thing 1')
      expect(dom.text('#thinger-list li', 1)).toBe('Thing 2')
      expect(dom.text('#thinger-list li', 2)).toBe('Thing 3')
    })

    it('should find() Nth items in #thinger-list', function() {
      expect(dom.find('#thinger-list li', 0).text()).toBe('Thing 1')
      expect(dom.find('#thinger-list li', 1).text()).toBe('Thing 2')
      expect(dom.find('#thinger-list li', 2).text()).toBe('Thing 3')
    })

    it('should count items in #thinger-list', function() {
      expect(dom.count('#thinger-list li')).toBe(3)
    })

    it('should count items in current context', function() {
      expect(dom.find('#thinger-list li').count()).toBe(3)
    })

    it('should throw exception when setInputValue selector is not found', function() {
      expect(function() { dom.setInputValue('#blah') }).toThrow(new Error('Element "#blah" not found to setInputValue'))
    })

    it('should setInputValue on input#deep-thought-inp', function() {
      expect(dom.text('#deep-thought-val')).toBe('42')
      dom.setInputValue('#deep-thought-inp', 'Fun Fun Fun')
      expect(dom.text('#deep-thought-val')).toBe('Fun Fun Fun')
    })

    it('should set input val() on input#deep-thought-inp', function() {
      expect(dom.text('#deep-thought-val')).toBe('42')
      var ret = dom.find('#deep-thought-inp').val('Fun Fun Fun')
      expect(dom.text('#deep-thought-val')).toBe('Fun Fun Fun')
      expect(ret).toBe('Fun Fun Fun')
    })

    it('should return current val() when no args are sent', function() {
      expect(dom.text('#deep-thought-val')).toBe('42')
      expect(dom.find('#deep-thought-inp').val()).toBe('42')
    })

    it('should get cssClasses() and return hasClass() true for #french-yeoman', function() {
      expect(dom.find('#french-yeoman').cssClasses()).toBe('huguenot proletariat')
      expect(dom.find('#french-yeoman').hasClass('proletariat')).toBeTruthy()
    })
  })

  describe('<link-fn-directive>', function() {
    beforeEach(inject(function(DirectiveHelper) {
      dom = DirectiveHelper.compileFn('<div link-fn-directive></div>', false)()
    }))

    describe('syntheticMouseEvent', function() {
      it('should show Element Mouse Down on mousedown', function() {
        dom.syntheticMouseEvent('mousedown', 1,2)
        expect(dom.text('span')).toContain('Element Mouse Down')
        expect(dom.text('span')).toContain('1,2')
      })

      it('should show Element Mouse Down on mousedown and set x,y to 0,0 when params are not sent', function() {
        dom.syntheticMouseEvent('mousedown')
        expect(dom.text('span')).toContain('Element Mouse Down')
        expect(dom.text('span')).toContain('0,0')
      })

      it('should show Element Mouse Move on mousemove', function() {
        dom.syntheticMouseEvent('mousemove', 75,80)
        expect(dom.text('span')).toContain('Element Mouse Move')
        expect(dom.text('span')).toContain('75,80')
      })

      it('should show Document Mouse Down on document mousedown event', function() {
        dom.syntheticMouseEvent('mousedown', 10,20, document)
        expect(dom.text('span')).toContain('Document Mouse Down')
        expect(dom.text('span')).toContain('10,20')
      })

      it('should show Document Mouse Move on document mousedown event', function() {
        dom.syntheticMouseEvent('mousemove', 100,200, document)
        expect(dom.text('span')).toContain('Document Mouse Move')
        expect(dom.text('span')).toContain('100,200')
      })
    })

    describe('triggerEvent', function() {
      it('should show Element Mouse Down on mousedown', function() {
        dom.triggerEvent('mousedown', { shiftKey: true })
        expect(dom.text('span')).toContain('Element Mouse Down')
      })

      it('should show "Top Gear" when shiftKey: true on mousemove', function() {
        dom.triggerEvent('mousemove', { shiftKey: true })
        expect(dom.text('sel')).toContain('Top Gear')
      })
    })
  })

})

