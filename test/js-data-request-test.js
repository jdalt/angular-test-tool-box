describe('Fabricator', function() {

  var compile, Req, dom

  beforeEach(inject(function(DirectiveHelper, RequestHelper) {
    compile = DirectiveHelper.compileFn('<div js-data-directive></div>')
    Req = RequestHelper
  }))

  it('should compile with expectation of /api/mammals/cats/1 request', function() {
    Req.expectOne('/api/mammals/cats', 1, { result: { id: 1, name: 'Roger' } })
    dom = compile()
  })

  it('should request cat and display cat name in #litter-box', function() {
    Req.expectOne('/api/mammals/cats', 1, { result: { id: 1, name: 'Meowth' } })
    dom = compile()
    expect(dom.findText('#litter-box')).toBe('Meowth')
  })

})
