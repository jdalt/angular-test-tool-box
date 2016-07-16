describe('DomHelper', function() {

  var Fab

  beforeEach(module('jdalt.toolBox', function (FabricatorProvider) {

    FabricatorProvider
      .fab('dog', {
        id: 1,
        name: 'Woofie',
        breed: 'Snozer'
      })
      .fab('cat', {
        id: 1,
        name: 'Snarl',
        pelt: 'Orange'
      })

  }))

  beforeEach(inject(function(Fabricator) {
    Fab = Fabricator
  }))

  it('should return a simple Fabricated object', function() {
    var cat = Fab('cat')
    expect(cat.name).toBe('Snarl')
    expect(cat.pelt).toBe('Orange')
  })

  it('should override Fabricator definition with new properties', function() {
    var cat = Fab('cat', { name: 'Fang the Ocelot' })
    expect(cat.name).toBe('Fang the Ocelot')
    expect(cat.pelt).toBe('Orange')
  })

  it('should not mutate original fabricator definition if a fabricated result is mutated', function() {
    var mutantCat = Fab('cat')
    mutantCat.name = 'Shere Khan'
    var newCoolCat = Fab('cat')

    expect(mutantCat.name).toBe('Shere Khan')
    expect(newCoolCat.name).toBe('Snarl')
  })

})

