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
    var req = Req.expectOne('/api/rocket', 1)
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#radio-one')
    Req.flush()
  })

  it('expectOne should use of response when 2nd param is obj', function() {
    dom = compile()
    var req = Req.expectOne('/api/rocket', { id: 1 })
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#radio-one')
    Req.flush()
  })

  it('should expectMany /api/rocket when #radio-many clicked', function() {
    dom = compile()
    var req = Req.expectMany('/api/rocket')
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#radio-many')
    Req.flush()
  })

  it('should expectMany /api/rocket with query params when #radio-usa clicked', function() {
    dom = compile()
    var req = Req.expectMany('/api/rocket', { type: 'us' })
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#radio-usa')
    Req.flush()
  })

  it('should expectCreate /api/rocket when #launch-pad clicked', function() {
    dom = compile()
    var req = Req.expectCreate('/api/rocket', { action: 'Create' })
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#launch-pad')
    Req.flush()
  })

  it('should expectUpdate /api/rocket/1 when #deep-orbit clicked', function() {
    dom = compile()
    var req = Req.expectUpdate('/api/rocket', 1, { action: 'Update' })
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#deep-orbit')
    Req.flush()
  })

  it('should expectUpsert /api/rocket/1 when #low-orbit clicked', function() {
    dom = compile()
    var req = Req.expectUpsert('/api/rocket', 1, { action: 'Upsert' })
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#low-orbit')
    Req.flush()
  })

  it('should expectDelete /api/rocket/1 when #landing-zone clicked', function() {
    dom = compile()
    var req = Req.expectDestroy('/api/rocket', 1)
    expect(req.respond).toEqual(jasmine.any(Function))
    dom.click('#landing-zone')
    Req.flush()
  })

  describe('when', function() {
    it('should respond with the same value for multiple requests', function() {
      dom = compile()
      Req.whenOne('/api/rocket', 1)
      dom.click('#radio-one')
      dom.click('#radio-one')
      dom.click('#radio-one')
      Req.flush()
    })

    it('should respond with the same value for multiple requests', function() {
      dom = compile()
      Req.whenMany('/api/rocket')
      dom.click('#radio-many')
      dom.click('#radio-many')
      dom.click('#radio-many')
      Req.flush()
    })

    it('should overwrite the previous value on multiple calls', function() {
      dom = compile()
      Req.whenOne('/api/rocket', 1, 'one first response')
      Req.whenMany('/api/rocket', {}, ['many first response'])
      dom.click('#radio-one')
      dom.click('#radio-many')
      Req.flush()
      expect(dom.text('#radio-one')).toBe('one first response')
      expect(dom.text('#radio-many')).toBe('many first response')

      Req.whenOne('/api/rocket', 1, 'one second response')
      Req.whenMany('/api/rocket', {}, ['many second response'])
      dom.click('#radio-one')
      dom.click('#radio-many')
      Req.flush()
      expect(dom.text('#radio-one')).toBe('one second response')
      expect(dom.text('#radio-many')).toBe('many second response')
    })
  })

})
