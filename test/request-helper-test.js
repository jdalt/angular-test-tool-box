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
    dom.click('#radio-one')
    Req.flush()
  })

  it('expectOne should use of response when 2nd param is obj', function() {
    dom = compile()
    Req.expectOne('/api/rocket', { id: 1 })
    dom.click('#radio-one')
    Req.flush()
  })

  it('should expectMany /api/rocket when #radio-many clicked', function() {
    dom = compile()
    Req.expectMany('/api/rocket')
    dom.click('#radio-many')
    Req.flush()
  })

  it('should expectMany /api/rocket with query params when #radio-usa clicked', function() {
    dom = compile()
    Req.expectMany('/api/rocket', { type: 'us' })
    dom.click('#radio-usa')
    Req.flush()
  })

  it('should expectCreate /api/rocket when #launch-pad clicked', function() {
    dom = compile()
    Req.expectCreate('/api/rocket', { action: 'Create' })
    dom.click('#launch-pad')
    Req.flush()
  })

  it('should expectUpdate /api/rocket/1 when #deep-orbit clicked', function() {
    dom = compile()
    Req.expectUpdate('/api/rocket', 1, { action: 'Update' })
    dom.click('#deep-orbit')
    Req.flush()
  })

  it('should expectUpsert /api/rocket/1 when #low-orbit clicked', function() {
    dom = compile()
    Req.expectUpsert('/api/rocket', 1, { action: 'Upsert' })
    dom.click('#low-orbit')
    Req.flush()
  })

  it('should expectDelete /api/rocket/1 when #landing-zone clicked', function() {
    dom = compile()
    Req.expectDestroy('/api/rocket', 1)
    dom.click('#landing-zone')
    Req.flush()
  })

  describe('when', function() {
    it('shoud respond with the same value for multiple requests', function() {
      dom = compile()
      Req.whenOne('/api/rocket', 1)
      dom.click('#radio-one')
      dom.click('#radio-one')
      dom.click('#radio-one')
      Req.flush()
    })

    it('shoud respond with the same value for multiple requests', function() {
      dom = compile()
      Req.whenMany('/api/rocket')
      dom.click('#radio-many')
      dom.click('#radio-many')
      dom.click('#radio-many')
      Req.flush()
    })
  })

})
