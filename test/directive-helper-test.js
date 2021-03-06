describe('DirectiveHelper', function() {

  var dom, compile

  describe('for closed directives', function() {
    beforeEach(inject(function(DirectiveHelper) {
      compile = DirectiveHelper.compileFn('<div simple-directive></div>')
    }))

    it('should compile a simple directive', function() {
      compile()
    })

    it('should return el with correct text after compile', function() {
      dom = compile()
      expect(dom.$el.find('h1').text()).toEqual('Simple Directive H1')
      expect(dom.$el.find('#simp-button').text()).toEqual('Do A Thing')
    })

    it('should attach the element into the DOM if `attach` specified in options', function() {
      dom = compile(null, { attach: true })
      expect(angular.element('#simp-main').length).toEqual(1) // angular.element searches from the body
    })
  })

  describe('for directives that accept scope parameters', function() {
    beforeEach(inject(function(DirectiveHelper) {
      compile = DirectiveHelper.compileFn('<div bi-directional-directive two-way="twoWay"></div>', false)
    }))

    it('should compile a bidirectional directive', function() {
      compile()
    })

    it('should return el with correct text after compile', function() {
      dom = compile({ twoWay: 'Velvet Goldmine' })
      expect(dom.$el.find('#main').text()).toEqual('Velvet Goldmine')
    })

    it('should return dom with scope after compile', function() {
      dom = compile({ twoWay: 'Velvet Goldmine' })
      expect(dom.scope.twoWay).toEqual('Velvet Goldmine')
    })

    it('should allow tester to change scope and affect directive after digest', function() {
      dom = compile({ twoWay: 'Velvet Goldmine' })

      dom.scope.twoWay = 'Bowie'
      dom.scope.$digest()

      expect(dom.$el.find('#main').text()).toEqual('Bowie')
    })
  })

})
