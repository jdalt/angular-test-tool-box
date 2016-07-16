describe('Fabricator', function() {

  var Fab

  beforeEach(module('jdalt.toolBox', function (FabricatorProvider) {

    FabricatorProvider
      .fab('cat', {
        id: 1,
        name: 'Snarl',
        pelt: 'Orange',
        claws: false,
      })
      .fab('junk-lion', {
        $parent: 'junk-cat',
        name: 'Junk Lion'
      })
      .fab('lion', {
        $parent: 'cat',
        name: 'King',
        claws: true,
      })
      .fab('simba', {
        $parent: 'lion',
        name: 'Simba',
        pelt: 'royal',
      })

  }))

  beforeEach(inject(function(Fabricator) {
    Fab = Fabricator
  }))

  it('should throw an exception if fabricator definition is not found', function() {
    expect(function() { Fab('junk') }).toThrow(new Error('No fabricator definition for junk'))
  })

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

  it('should throw an exception when parent cannnot be found', function() {
    expect(function() { Fab('junk-lion') }).toThrow(new Error('Parent fabricator junk-cat not found for junk-lion'))
  })

  it('should allow fabricators to inherit from one parent', function() {
    var lion = Fab('lion')

    expect(lion.name).toBe('King')
    expect(lion.id).toBe(1)
    expect(lion.claws).toBe(true)
  })

  it('should allow fabricators to inherit from a chain of parents', function() {
    var simba = Fab('simba')

    expect(simba.name).toBe('Simba')
    expect(simba.id).toBe(1)
    expect(simba.claws).toBe(true)
    expect(simba.pelt).toBe('royal')
  })

})
