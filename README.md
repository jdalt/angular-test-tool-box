Angular Test Tool Box
=====================

[![Build Status](https://travis-ci.org/jdalt/angular-test-tool-box.svg?branch=master)](https://travis-ci.org/jdalt/angular-test-tool-box)

Angular test helpers injected as an angular module.

This module is an attempt to standardize the way a component based (basically: directives) Angular application is tested. By grouping methods as a set of factories that can be injected in tests, you can avoid making global test helpers and eliminate singnificant amounts of boiler plate to just get down to the business of testing your application.


### Problem 1: Mario Bring Your Pipe Wrench
===
Although Angular is "built for testability" using depdency injection and modular principles the ergonomics of that testability are often lacking out of the box. To do most basic testing tasks you must become an expert plumber angular and run the process of injection which is tedious and burdensome.

Example - Controller Test
```
  beforeEach(inject(function(_$rootScope_, _$controller_, MockService) {
    $rootScope = _$rootScope_
    $controller = _$controller_

    mockAlerts = new mock.AlertService()
    mockCollection = mockPersona.buildCollection(personaFixture(), {pagination: {page: 2, per_page: 10, total_pages:2}})
    $rootScope.organization = mockOrg

    createController = function(mockPersona, stateParams) {
      if(!stateParams)  {
        stateParams = {}
      }
      return $controller('PlayerListController', {'$scope' : $rootScope, '$stateParams': stateParams, 'Alerts': mockAlerts, 'Persona': mockPersona})
    }
  }))
  
  describe('ListController#constructor', function() {

    beforeEach(function() {
      spyOn(mockPersona, "getList").and.returnValue({
        then: function(success, failure) {
          success(mockCollection)
        }
      })
      controller = createController(mockPersona, {page:2, order_by:'name', direction:'asc'})
    })

    it('should fetch all the personas from the service', function() {
      expect(mockPersona.getList).toHaveBeenCalledWith({page:2, order_by:'name', direction:'asc'})
      expect(controller.personas).toEqual(mockCollection)
      expect(controller.pagination.totalPages).toEqual(mockCollection.metadata.pagination.total_pages)
    })
  })

```

That's a ton of work! And it's a fairly weak and brittle test. You never hit your template, the dom, or the http layer. Mocks prevent most of your actual domain code from running. Spies require internal knowledge of methods and call structures while require synchronization if there are changes on the object being spied upon. Unit tests like this are really like a bunch of one offs recreation of compiler checks that dynamic languages lack. Creating one off psuedo compilers is a poor use of your time. There's got to be a better way!

### Revelation 1: Components all the Way Down
====
To quote Bertrand Russell - it's components all the way down homie. If you build an Angular application completely out of directives, you don't have to plumb out unit tests in the guts of Angular.

Example 2 - Directive Testing
```
  beforeEach(inject(function() {
    scope = $rootScope.$new()
  }))

  function compile() {
    var tmpl = "<div persona-question personas='personas'></div>"

    _.defaults(scope, {
      personas: personas
    })

    elem = $compile(tmpl)(scope)
    scope.$digest()
  }

  it('should compile', function() {
    compile()
  })

  describe('when adding a player', function() {
    describe('with 1 empty player passed in', function() {
      beforeEach(function() {
        personas = [{}]
        compile()
      })

      it('it should have 1 player with 4 inputs', function() {
        var playerRows = elem.find('tbody tr')
        expect(scope.players.length).toBe(rows)
        expect(playerRows.length).toBe(rows)

      })
    })
  })
```

This is still long and there's still gross googley Angular guts all over it, but we won a couple things too. First, we're testing actual dom. This test isn't nearly as brittle as a controller unit test because we're testing the "outside-in" on the results of the directive on the dom. For the guts of the directive, we're just like: deal with it. We're also relying on global namespace pollution to do some dirty work. Where did that `$rootScope` come from? How about that `$compile` function. Please search your project directory now and waste copious amounts of time debugging if something goes wrong. Also: wither forget jshinting your tests or codify all that namespace pollution into your config file. Wouldn't it be awesome if we could write directive tests like this without boilerplate or global namespace pollution? Wouldn't it be nice if could auto-generate a passing test that compiled a directive.

### Solution - Use Angular to Test Angular
===
First we need a method to build a directive compile function that's sufficently general to accomodate 95% of of our needs and promote good honest behavior with directives. Here's what I came up with for that: https://github.com/jdalt/angular-test-tool-box/blob/master/src/directive-helper.js

The basic idea is to generate a function that takes in the outer scope so that we can pass directives new inputs each time we compile them. This gives us a good amount of general flexibility. Also by creating a module and a factory we don't have to run the injector in a weird test way -- we run it the normal angular way. We'll still have inject this service, but that's it. We've also solved our global namespace pollution problem by using a module. This will now pass jshint successfully.

One fun thing about creating a testing module is that testing the testor creates self demonstrating examples. See https://github.com/jdalt/angular-test-tool-box/blob/master/test/directive-helper-test.js for examples in how to use the directive helper.

### Problem - Http Requests
===
When testing a frontend app in isolation all that juicy and delicious server data is gone, inaccessible on a server in sky. So what do we do to test a data driven application? We can spy on methods that hit the server and pass back data. However in doing so we'll need to directly access the controller (the opposite of "outside-in" testing) and subjectively mock out each request (tedious tedious yuck yuck). We'll also completely bypass our request library. Want to upgrade JsData or Restangular? Have fun your unit tests don't know jack about you're request libraries. You are alone in the wilderness in a world before test enlightenment.

Angular (through `angular-mocks`) actually provides with a pretty decent solution to this called `$httpBackend` which gets down and dirty with the `$http` method that all these libraries implement and intercepts request like some hypothetical thought intercepting demon. Bomb. Except that it's sort of janky and long winded and doesn't come with fixture library.

Example - `$httpBackend` Expectations
```
TODO
```

### Solution - `RequestHelper` + `Fab`
===
To make request mocking as butter smooth and low friction as possible we have `RequestHelper`. Check it out the code here:
https://github.com/jdalt/angular-test-tool-box/blob/master/src/request-helper.js
Self demonstrating test/example:
https://github.com/jdalt/angular-test-tool-box/blob/master/test/request-helper-test.js

This solves a couple problems. First, when integrated with request libraries endpoint definitions we no longer have to specify the url each time we want to mock out a request. This gives us a much more robust test because we change url details in the request library and they will instantly be reflected in the test.
