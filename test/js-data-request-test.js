describe('JsData Request', function() {

  var compile, Req, dom, DS

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
    RequestHelperProvider.setBasePath(DSHttpAdapterProvider.defaults.basePath) // necessary?

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
    .fab('org', {
      id: 33,
      name: 'Sesame Street'
    })
    .fab('stoneOrg', {
      $parent: 'org',
      id: 66,
      name: 'Flintstone Quarry'
    })
    .fab('owner', {
      id: 9,
      name: 'Oscar',
      org_id: 33
    })

  }))

  beforeEach(inject(function(DirectiveHelper, RequestHelper, _DS_) {
    Req = RequestHelper
    dom = DirectiveHelper.compileFn('<div js-data-directive></div>', false)()
    DS = _DS_
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
    describe('"One" request', function() {

      it('should throw an exception when resource definition "junk" is not found', function() {
        expect(function() { Req.expectOne('junk', 1) }).toThrow(new Error('No fabricator definition for junk'))
      })

      it('should compile with expectation of "cat"', function() {
        Req.expectOne('cat', 1)
        dom.click('#catnip').flush()
      })

      it('should compile with expectation of "lion" and set url for parent correctly', function() {
        Req.expectOne('lion', { id: 1 })

        DS.find('cat', 1).then( function(lion) {
          expect(lion.name).toBe('King')
          expect(lion.claws).toBe(true)
        })

        Req.flush()
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

    })

    describe('"Many" request', function() {

      it('should throw an exception when response is not an array', function() {
        expect(function() {
          Req.expectMany('cat', {}, { name: 'Not Array' })
        }).toThrow(new Error('Response must be an array'))
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

      describe('overwriteParams', function() {
        it('should merge over result for "expect" request', function() {
          Req.expectMany('monkey', {}, [{}], { result: [{id: 1, newProp: 'bar'}] })
          DS.findAll('monkey', {}).then(function(monkeys) {
            expect(monkeys[0].id).toBe(1)
            expect(monkeys[0].newProp).toBe('bar')
          })

          Req.flush()
        })

        it('should merge over result for "when" request', function() {
          Req.whenMany('monkey', {}, [{}], { result: [{id: 1, newProp: 'bar'}] })
          DS.findAll('monkey', {}).then(function(monkeys) {
            expect(monkeys[0].id).toBe(1)
            expect(monkeys[0].newProp).toBe('bar')
          })

          Req.flush()
        })
      })

    })

    describe('nested resources', function() {

      it('should use nested url to request "owners"', function() {
        Req.expectMany('owner', { org_id: 10 })
        DS.findAll('owner', { org_id: 10 })
        Req.flush()
      })

      it('should use nested url to request "owners" with extra params', function() {
        Req.expectMany('owner', { org_id: 10, moarStuff: 99 })
        DS.findAll('owner', { org_id: 10, moarStuff: 99 })
        Req.flush()
      })

      it('should use nested url when calling loadRelations and correctly fabricate nested object', function() {
        Req.expectOne('org', { id: 66 })
        Req.expectMany('owner', { org_id: 66 }, [{org_id: 66}])

        DS.find('org', 66).then(function(org) {
          DS.loadRelations('org', org, ['owner']).then( function(org) {
            expect(org.owner.id).toBe(9)
            expect(org.owner.org_id).toBe(66)
            expect(org.owner.name).toBe('Oscar')
          })
        })
        Req.flush()
      })

    })

    describe('expectCreate', function() {
      it('should send request and return unwrapped response', function() {
        var org = { id: 66, name: "Spacely's Sprockets" }
        Req.expectCreate('org', org)

        var orgNoId = angular.copy(org)
        delete orgNoId.id

        DS.create('org', orgNoId).then( function(orgRes) {
          expect(orgRes.id).toBe(66)
          expect(orgRes.name).toBe("Spacely's Sprockets")
        })

        Req.flush()
      })

      it('should allow tester to overwrite response with 3rd parameter', function() {
        var orgParams = { name: "Spacely's Sprockets" }
        var createResp = angular.copy(orgParams)
        createResp.id = 44
        createResp.fieldAddedByServer = 411
        Req.expectCreate('org', orgParams, createResp)

        DS.create('org', orgParams)
        Req.flush()

        var org = DS.get('org', 44)

        expect(org.name).toBe("Spacely's Sprockets")
        expect(org.fieldAddedByServer).toBe(411)
      })
    })

    describe('expectUpdate', function() {
      it('should send request without computed property and return unwrapped response', function() {
        // Note: The 'org' resource has computed property named 'synthetic'
        // that should not be sent in the request.
        var org = DS.inject('org', { id: 66, name: "Spacely's Sprockets", owner: { id: 1, name: "Spacely" } })
        Req.expectUpdate('org', org)

        DS.update('org', 66, org).then( function(orgRes) {
          expect(orgRes.name).toBe("Spacely's Sprockets")
        })

        Req.flush()
      })

      it('should allow tester to overwrite response with 3rd parameter', function() {
        var orgParams = { id: 66, name: "Spacely's Sprockets" }
        var org = DS.inject('org', orgParams)

        var responseParams = angular.copy(orgParams)
        responseParams.fieldAddedByServer = 411
        Req.expectUpdate('org', org, responseParams)

        expect(org.fieldAddedByServer).toBeUndefined()

        DS.update('org', 66, org)
        Req.flush()

        expect(org.fieldAddedByServer).toBe(411)
      })

      it('should set accurate url when a child resource fabricator is used on expectation', function() {
        var org = DS.inject('org', { id: 5, name: 'Mutations!!' })
        Req.expectUpdate('stoneOrg', org)

        DS.update('org', 5, org)

        Req.flush()
      })
    })

    describe('expectUpsert', function() {
      it('should send request without computed property and return unwrapped response', function() {
        // Note: The 'org' resource has computed property named 'synthetic'
        // that should not be sent in the request.
        var org = DS.inject('org', { id: 66, name: "Spacely's Sprockets", owner: { id: 1, name: "Spacely" } })
        Req.expectUpsert('org', org)

        DS.update('org', 66, org, { method: 'PATCH' }).then( function(orgRes) {
          expect(orgRes.name).toBe("Spacely's Sprockets")
        })

        Req.flush()
      })
    })

    describe('expectDestroy', function() {
      it('should initiate a DELETE request when cat-trap clicked', function() {
        Req.expectDestroy('cat', 1)
        dom.click('#cat-trap')
        Req.flush()
      })
    })

  })

})
