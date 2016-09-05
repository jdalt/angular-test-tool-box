describe('JsData Request', function() {

  var compile, Req, dom

  beforeEach(function () {
    module('dummy-js-data')
  })

  // Turn off js-data logging to keep test reporter clear
  beforeEach(module('dummy', function (DSHttpAdapterProvider) {
    angular.extend(DSHttpAdapterProvider.defaults, {
      log: false,
      error: false,
    })
  }))

  beforeEach(module('jdalt.toolBox', function (FabricatorProvider, RequestHelperProvider, DSHttpAdapterProvider) {

    function wrapResult(data) {
      return { result: data }
    }

    RequestHelperProvider.setResponseTransformer(wrapResult)
    RequestHelperProvider.setBasePath(DSHttpAdapterProvider.defaults.basePath)

    FabricatorProvider
    .fab('cat', {
      id: 1,
      name: 'Snarl',
      pelt: 'Orange',
      claws: false,
    })
    .fab('lion', {
      $parent: 'cat',
      name: 'King',
      claws: true,
    })
    .fab('monkey', {
      id: 10,
      name: 'Mustapha',
      bananas: 10
    })

  }))

  beforeEach(inject(function(DirectiveHelper, RequestHelper) {
    Req = RequestHelper
    dom = DirectiveHelper.compileFn('<div js-data-directive></div>', false)()
  }))

  describe('raw url expectations', function() {
    it('should compile with expectation of /api/mammals/cats/1 request', function() {
      Req.expectOne('/api/mammals/cats', 1, { result: { id: 1, name: 'Roger' } })
      dom.click('#catnip').flush()
    })

    it('should request cat and display cat name in #litter-box', function() {
      Req.expectOne('/api/mammals/cats', 1, { result: { id: 1, name: 'Meowth' } })
      dom.click('#catnip').flush()
      expect(dom.text('#litter-box')).toBe('Meowth')
    })

    it('should request monkey and display monkey names <li>', function() {
      Req.expectMany('/api/bed/monkeys', { bunch: 10 }, { result: [{ id: 1, name: 'Monkey 1' }, { id: 2, name: 'Monkey 2'}] })
      dom.click('#monkey-button').flush()

      expect(dom.text('ul li')).toContain('Monkey 1')
      expect(dom.text('ul li')).toContain('Monkey 2')
    })
  })

  describe('resource definition expectations', function() {
    it('should throw an exception when resource definition "junk" is not found', function() {
      expect(function() { Req.expectOne('junk', 1) }).toThrow(new Error('No fabricator definition for junk'))
    })

    it('should throw an exception when response is not an array for expectMany', function() {
      expect(function() {
        Req.expectMany('cat', {}, { name: 'Not Array' })
      }).toThrow(new Error('Response must be an array'))
    })

    it('should compile with expectation of "cat"', function() {
      Req.expectOne('cat', 1)
      dom.click('#catnip').flush()
    })

    it('should request cat and display cat name of default cat fabricator in #litter-box', function() {
      Req.expectOne('cat', 1)
      dom.click('#catnip').flush()
      expect(dom.text('#litter-box')).toBe('Snarl')
    })

    it('should request cat and display cat name of default cat fabricator in #litter-box by getting id from response', function() {
      Req.expectOne('cat')
      dom.click('#catnip').flush()
      expect(dom.text('#litter-box')).toBe('Snarl')
    })

    it('should request cat and display cat name in #litter-box', function() {
      Req.expectOne('cat', 1, { name: 'Meowth' })
      dom.click('#catnip').flush()
      expect(dom.text('#litter-box')).toBe('Meowth')
    })

    it('should request monkey and display monkey names <li>', function() {
      Req.expectMany('monkey', { bunch: 10 }, [{ id: 1, name: 'Monkey 1' }, { id: 2, name: 'Monkey 2', bananas: 77 }])
      dom.click('#monkey-button').flush()

      expect(dom.text('ul li')).toContain('Monkey 1')
      expect(dom.text('ul li')).toContain('10')
      expect(dom.text('ul li')).toContain('Monkey 2')
      expect(dom.text('ul li')).toContain('77')
    })

    it('should return empty array when no "res" arg are sent', function() {
      Req.expectMany('monkey', { bunch: 10 })
      dom.click('#monkey-button').flush()
      expect(dom.count('ul li')).toBe(0)
    })

    it('should extend passed object with fabricator object', function() {
      Req.expectMany('monkey', { bunch: 10 }, [{}])
      dom.click('#monkey-button').flush()
      expect(dom.text('ul li', 0)).toContain('Mustapha')
      expect(dom.text('ul li', 0)).toContain('10')
    })

    it('should return empty array when no "res" arg sent', function() {
      Req.whenMany('monkey', { bunch: 10 })
      dom.click('#monkey-button').flush()
      expect(dom.count('ul li')).toBe(0)
    })
  })


})
