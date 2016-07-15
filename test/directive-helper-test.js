describe('DirectiveHelper', function() {

  var dom, compile

  beforeEach(inject(function(DirectiveHelper) {
    compile = DirectiveHelper.compileFn('<div simple-directive></div>', false)
  }))

  it('should compile a simple directive', function() {
    compile()
  })

  it('should return el with correct text after compile', function() {
    dom = compile()
    expect(dom.el.find('h1').text()).toEqual('Simple Directive H1')
    expect(dom.el.find('#simp-button').text()).toEqual('Do A Thing')
  })

})
