'use strict';

angular.module('jdalt.toolBox', [])

// Required for Angular < 1.4
angular.module('jdalt.toolBox')
.provider('$backportedParamSerializer', function () {

  function sortedKeys(obj) {
    return Object.keys(obj).sort();
  }

  function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for (var i = 0; i < keys.length; i++) {
      iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
  }

  function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%3B/gi, ';').
      replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
  }

  function serializeValue(v) {
    if (isObject(v)) {
      return isDate(v) ? v.toISOString() : toJson(v);
    }
    return v;
  }

  function isUndefined(value) { return typeof value === 'undefined'; }

  var isArray = Array.isArray;

  function isObject(value) {
    // http://jsperf.com/isobject4
    return value !== null && typeof value === 'object';
  }


  return {
    $get: function() {
      return function ngParamSerializer(params) {
        if (!params) return '';
        var parts = [];
        forEachSorted(params, function(value, key) {
          if (value === null || isUndefined(value)) return;
          if (isArray(value)) {
            forEach(value, function(v, k) {
              parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(v)));
            });
          } else {
            parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(value)));
          }
        });

        return parts.join('&');
      };
    }
  }

})

angular.module('jdalt.toolBox')
.factory('DirectiveHelper', ["$compile", "$rootScope", "$httpBackend", "DomHelper", function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper
) {

  function compileFn(tmpl, flushRequests) {

    return function compile(scopeParams) {
      scopeParams = scopeParams || {}
      var scope = $rootScope.$new()

      angular.extend(scope, scopeParams)

      var el = $compile(tmpl)(scope)
      scope.$digest()

      if(flushRequests || flushRequests === undefined) $httpBackend.flush()

      return angular.extend({ scope: scope }, DomHelper(el))
    }

  }

  return {
    compileFn: compileFn
  }

}])

angular.module('jdalt.toolBox')
.factory('DomHelper', ["$httpBackend", function(
  $httpBackend
) {

  function DomHelper(root) {
    return {
      $el: root, // jQuery wrapped element

      element: root[0], // first or only plain dom object

      flush: $httpBackend.flush,

      log: function() {
        root.each(function(index, el) {
          console.log('element', index, el)
        })
        return this
      },

      click: function(selector, nth) {
        if(!selector) { // proxy click on root
          root.click()
          return this
        }

        var clickEl = root.find(selector)
        if(!clickEl.length) {
          throw new Error('Element "'+ selector +'" not found to click')
        }
        if(nth != null) clickEl = clickEl.eq(nth)
        clickEl.click()

        return DomHelper(clickEl)
      },

      // Experimental, attempts to generate clicks when all else fails
      _clickHard: function(selector) {
        var el = root[0]
        if(selector) el = root.find(selector)[0]

        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
          "click",
          true /* bubble */, true /* cancelable */,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
        )
        el.dispatchEvent(ev)
      },

      clickButton: function(buttonText) {
        var buttonEl = root.find('button:contains("' + buttonText + '")')

        if(buttonEl.length == 0) throw new Error('<button>' + buttonText + '</button> not found')
        if(buttonEl.length >= 2) throw new Error('More than one <button>' + buttonText + '</button> found')

        buttonEl.click()
        return DomHelper(buttonEl)
      },

      setInputValue: function(selector, inputVal) {
        var inputEl = root.find(selector)
        if(!inputEl.length) {
          throw new Error('Element "'+ selector +'" not found to setInputValue')
        }

        inputEl.val(inputVal).trigger('change')
        return DomHelper(inputEl)
      },

      val: function(value) {
        if(value) root.val(value).trigger('change')
        return root.val()
      },

      cssClasses: function() {
        return root.prop('class')
      },

      hasClass: function(cssClass) {
        return root.hasClass(cssClass)
      },

      count: function(selector) {
        var el = root
        if(selector) el = root.find(selector)
        return el.length
      },

      find: function(selector, nth) {
        var el = root.find(selector)
        if(nth != null) el = el.eq(nth)
        return DomHelper(el)
      },

      text: function(selector, nth) {
        var el = root
        if(selector) el = root.find(selector)
        if(nth != null) el = el.eq(nth)
        return el.text()
      }

    }

  }

  return DomHelper

}])

angular.module('jdalt.toolBox')
.provider('Fabricator', function () {

  var fabDefinitions = {};

  var provider = {

    fab: function (name, obj) {
      fabDefinitions[name] = obj
      return provider
    },

    definitions: function() {
      return fabDefinitions
    },

    $get: function () {
      return function(name, override) {
        var fabDef = fabDefinitions[name]

        if(!fabDef) {
          throw new Error('No fabricator definition for ' + name)
        }

        // Iteratively merge up chain of ancestors
        if(fabDef.$parent) {
          var current, previous, result
          previous = fabDef
          result = angular.merge({}, fabDef)
          while(previous.$parent) {
            current = fabDefinitions[previous.$parent]

            if(!current) {
              throw new Error('Parent fabricator ' + previous.$parent + ' not found for ' + name)
            }

            result = angular.merge({}, current, result) // use object literal {} to prevent mutation on fabricator definition
            previous = current
          }
          fabDef = result
        }

        return angular.merge({}, fabDef, override)
      }
    }
  }

  return provider

})

angular.module('jdalt.toolBox')
.factory('mockState', ["$state", "$rootScope", function(
  $state,
  $rootScope
) {

  return function mockState(stateName, stateParams) {
    $state.go(stateName, stateParams)
    $rootScope.$apply()
  }

}])

angular.module('jdalt.toolBox')
.provider('RequestHelper', function() {

  var basePath = ''
  var responseTransformer = function defaultTransformer(data) {
    return data
  }

  return {
    setResponseTransformer: function(transformFn) {
      responseTransformer = transformFn
    },

    setBasePath: function(path) {
      basePath = path
    },

    $get: ["$httpBackend", "$backportedParamSerializer", "Fabricator", "$injector", function (
      $httpBackend,
      $backportedParamSerializer,
      Fabricator,
      $injector
    ) {

      var resourceDefs = {}
      if($injector.has('DS')) {
        var DS = $injector.get('DS')
        resourceDefs = DS.definitions
      }

      function getEndpoint(resourceName) {
        var resource = resourceDefs[resourceName]
        if(!resource) throw new Error('Unable to find path for resource ' + resourceName)
        return resource.endpoint
      }

      function resourcePath(resourceName) {
        return basePath + getEndpoint(resourceName)
      }

      function fabricated(def, props) {
        if(isPath(def)) return props
        return Fabricator(def, props)
      }

      function manyFabricated(def, props) {
        if(isPath(def)) return props

        var fabObjs = []
        props.forEach(function(propObj) {
          fabObjs.push(Fabricator(def, propObj))
        })

        return fabObjs
      }

      function checkArray(def, props) {
        if(!isPath(def) && !angular.isArray(props)) {
          throw new Error('Response must be an array') // possible to override for custom envelope?
        }
      }

      // general request handling
      function queryString(params) {
        var qs = ''

        if(params) {
          qs = $backportedParamSerializer(params)
          if(qs != '') qs = '?' + qs
        }

        return qs
      }

      function isPath(def) {
        return def[0] == '/'
      }

      function fullPath(def) {
        if(isPath(def)) return def

        return resourcePath(def)
      }

      function getUrlMany(def, params) {
        return fullPath(def) + queryString(params)
      }

      function getUrlOne(def, id) {
        return fullPath(def) + '/' + id
      }

      return {
        flush: $httpBackend.flush,

        expectMany: function(def, params, res) {
          if(!isPath(def) && typeof res == 'undefined')  res = []
          checkArray(def, res)
          var url = getUrlMany(def, params)
          var resObjs = manyFabricated(def, res)
          if(!isPath(def)) resObjs = responseTransformer(resObjs)
          $httpBackend.expectGET(url).respond(200, resObjs)
        },

        whenMany: function(def, params, res) {
          if(!isPath(def) && typeof res == 'undefined')  res = []
          checkArray(def, res)
          var url = getUrlMany(def, params)
          var resObjs = manyFabricated(def, res)
          if(!isPath(def)) resObjs = responseTransformer(resObjs)
          $httpBackend.whenGET(url).respond(200, resObjs)
        },

        expectOne: function(def, id, res) {
          // Handle as (def, res) vs (def, id, res)
          if(angular.isObject(id)) res = id
          var resObj = fabricated(def, res)
          if(angular.isObject(id) || (id == null  && res == null) ) id = resObj.id
          if(!isPath(def)) resObj = responseTransformer(resObj)

          var url = getUrlOne(def, id)
          $httpBackend.expectGET(url).respond(200, resObj)
        },

        whenOne: function(def, id, res) {
          // Handle as (def, res) vs (def, id, res)
          if(angular.isObject(id)) res = id
          var resObj = fabricated(def, res)
          if(angular.isObject(id) || (id == null  && res == null) ) id = resObj.id
          if(!isPath(def)) resObj = responseTransformer(resObj)

          var url = getUrlOne(def, id)
          $httpBackend.whenGET(url).respond(200, resObj)
        },

        expectCreate: function(def, req, res) {
          var url = getUrlMany(def)
          $httpBackend.expectPOST(url, req).respond(200, res)
        },

        expectUpdate: function(def, id, req, res) {
          var url = getUrlOne(def, id)
          $httpBackend.expectPUT(url, req).respond(200, res)
        },

        expectUpsert: function(def, id, req, res) {
          var url = getUrlOne(def, id)
          $httpBackend.expectPATCH(url, req).respond(200, res)
        },

        expectDestroy: function(def, id) {
          var url = getUrlOne(def, id)
          $httpBackend.expectDELETE(url).respond(204, '')
        },
      }
    }]
  }

})
