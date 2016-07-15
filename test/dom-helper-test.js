describe('DomHelper', function() {

  var dom, compile

  beforeEach(inject(function(DirectiveHelper) {
    compile = DirectiveHelper.compileFn('<div simple-directive></div>', false)
  }))

  it('should findText of "Simple Directive H1"', function() {
    dom = compile()
    expect(dom.findText('h1')).toEqual('Simple Directive H1')
  })

  it('should click "simp-button" and cause directive result', function() {
    dom = compile()
    dom.clickButton('#simp-button')
    expect(dom.findText('p')).toEqual('Something Happened!')
  })

  it('should throw an error when clickButton element cannot be found', function() {
    dom = compile()
    expect(function() { dom.clickButton('#junk') }).toThrow(new Error('Element "#junk" not found to click'))
  })

})

