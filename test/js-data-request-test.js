describe('JsData Request', function() {

  var compile, Req, dom

  beforeEach(inject(function(DirectiveHelper, RequestHelper) {
    Req = RequestHelper
    dom = DirectiveHelper.compileFn('<div js-data-directive></div>', false)()
  }))

  describe('raw url expectations', function() {
    it('should compile with expectation of /api/mammals/cats/1 request', function() {
      Req.expectOne('/api/mammals/cats', 1, { result: { id: 1, name: 'Roger' } })
      dom.clickButton('#catnip')
      Req.flush()
    })

    it('should request cat and display cat name in #litter-box', function() {
      Req.expectOne('/api/mammals/cats', 1, { result: { id: 1, name: 'Meowth' } })
      dom.clickButton('#catnip')
      Req.flush()
      expect(dom.findText('#litter-box')).toBe('Meowth')
    })
  })

  describe('resource definition expectations', function() {
    it('should compile with expectation of "cat"', function() {
      Req.expectOne('cat', 1, { result: { id: 1, name: 'Roger' } })
      dom.clickButton('#catnip')
      Req.flush()
    })

    it('should request cat and display cat name in #litter-box', function() {
      Req.expectOne('cat', 1, { result: { id: 1, name: 'Meowth' } })
      dom.clickButton('#catnip')
      Req.flush()
      expect(dom.findText('#litter-box')).toBe('Meowth')
    })

    it('should request cat and display cat name in #litter-box', function() {
      Req.expectMany('monkey', { bunch: 10 }, { result: [{ id: 1, name: 'Monkey 1' }, { id: 2, name: 'Monkey 2'}] })
      dom.clickButton('#monkey-button')
      Req.flush()

      expect(dom.findText('ul li')).toContain('Monkey 1')
      expect(dom.findText('ul li')).toContain('Monkey 2')
    })
  })

})
