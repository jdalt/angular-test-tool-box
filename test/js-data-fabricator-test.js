describe('JsDataFabricator', function() {

  var DS, JsDataFabricator

  describe('with JsData included in a project', function() {

    beforeEach(function () {
      module('dummy-js-data')
    })

    beforeEach(module('jdalt.toolBox', function (FabricatorProvider) {

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

    }))

    beforeEach(inject(function(_DS_, _JsDataFabricator_) {
      DS = _DS_
      JsDataFabricator = _JsDataFabricator_
    }))

    it('should fabricate and inject cat', function() {
      var cat = JsDataFabricator('cat', { id: 100, laserEyes: true })

      expect(cat.name).toBe('Snarl')
      expect(cat.laserEyes).toBe(true)

      var dsCat = DS.get('cat', 100)
      expect(dsCat.name).toBe('Snarl')
      expect(dsCat.laserEyes).toBe(true)
    })

    it('should fabricate "lion" and inject it into "cat"', function() {
      var cat = JsDataFabricator('lion', { id: 100, laserEyes: true })

      expect(cat.name).toBe('King')
      expect(cat.laserEyes).toBe(true)

      var dsCat = DS.get('cat', 100)
      expect(dsCat.name).toBe('King')
      expect(dsCat.laserEyes).toBe(true)
    })

  })

  describe('without JsData included', function() {
    it('should throw an exception', function() {
      function injectRapper() { inject(function(JsDataFabricator) {}) }
      expect(injectRapper).toThrowError(/JsData/)
    })
  })

})
