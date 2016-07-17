describe('Fabricator', function() {

  var compile, Req, dom

  beforeEach(inject(function(DirectiveHelper, RequestHelper) {
    compile = DirectiveHelper.compileFn('<div http-request-directive></div>', false)
    Req = RequestHelper
  }))

  it('should compile', function() {
    compile()
  })

  it('should expectOne /api/rocket/1 when #radio-one clicked', function() {
    dom = compile()
    Req.expectOne('/api/rocket', 1)
    dom.clickButton('#radio-one')
    Req.flush()
  })

  it('should expectMany /api/rocket when #radio-many clicked', function() {
    dom = compile()
    Req.expectMany('/api/rocket')
    dom.clickButton('#radio-many')
    Req.flush()
  })

  it('should expectMany /api/rocket with query params when #radio-usa clicked', function() {
    dom = compile()
    Req.expectMany('/api/rocket', { type: 'us' })
    dom.clickButton('#radio-usa')
    Req.flush()
  })

})
