describe('mockState', function() {

  var mockState, dom

  beforeEach(function () {
    module('dummy-ui-router')
  })

  beforeEach(module('dummy-ui-router', function ($stateProvider) {

    $stateProvider
      .state('hello', {
        url: '/hello',
        template: '<h1>Hello!</h1>'
      })
      .state('goodbye', {
        url: '/goodbye/:id/moon',
        template: '<h2>See Ya...</h2>'
      })

  }))

  beforeEach(inject(function(DirectiveHelper, _mockState_) {
    mockState = _mockState_
    dom = DirectiveHelper.compileFn(
      '<div ng-app="dummy-ui-router">\n' +
        '<div ui-view=""></div>\n' +
      '</div>\n'
      , false)()
  }))

  it('should compile', function() {})

  it('should navigate to the template of "hello"', function() {
    mockState('hello')
    expect(dom.text()).toContain('Hello!')
  })

  it('should navigate to the template of "goodbye"', function() {
    mockState('goodbye', { id: 10 })
    expect(dom.text()).toContain('See Ya...')
  })

})
