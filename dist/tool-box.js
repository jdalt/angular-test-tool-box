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
.factory('baseResourceFinder', ["Fabricator", "$injector", function (
  Fabricator,
  $injector
) {

  // We do this to avoid requiring Js-Data in the 'jdalt.toolBox' module
  function getDS() {
    if(!$injector.has('DS')) {
      throw new Error('baseResourceFinder requires JsData "DS" provider')
    }
    return $injector.get('DS')
  }

  // Recursively climbs tree of Fabricators via $parent and then retrieves resource definition for base parent.
  function baseResourceFinder(def) {
    var DS = getDS()

    var fab = Fabricator(def)
    var resourceName = def

    if(!fab || !resourceName) throw new Error('Unable to find path for resource ' + def)

    while(fab.$parent) {
      resourceName = fab.$parent
      fab = Fabricator(resourceName)
    }

    return DS.definitions[resourceName]
  }

  return baseResourceFinder

}])

angular.module('jdalt.toolBox')
.factory('DirectiveHelper', ["$compile", "$rootScope", "$httpBackend", "DomHelper", function(
  $compile,
  $rootScope,
  $httpBackend,
  DomHelper
) {

  function compileFn(tmpl, options) {

    options = (typeof options == 'boolean') ? { flushRequests: options } : options || {}

    return angular.extend(function compile(scopeParams, overrideOptions) {
      scopeParams = scopeParams || {}
      var scope = $rootScope.$new()

      angular.extend(scope, scopeParams)
      var callOptions = angular.extend({}, options, overrideOptions)

      var cloneAttachFn
      if (callOptions.attach) cloneAttachFn = function(clone) { clone.appendTo('body') }

      var el = $compile(callOptions.template || compile.template)(scope, cloneAttachFn)
      scope.$digest()

      if (callOptions.flushRequests) $httpBackend.flush()
      var innerScope = el.isolateScope()

      return angular.extend({
        scope: scope,
        innerScope: innerScope,
        ctrl: innerScope && (innerScope.$ctrl || innerScope.ctrl)
      }, DomHelper(el))
    }, {
      template: tmpl
    })

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

    function normalizeText(str) {
      if (typeof str !== 'string') throw new Error('normalizeWhitespace called with a non-string argument: ' + typeof str)
      return str.replace(/\s+/g, ' ').trim()
    }

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

      triggerEvent: function(type, eventProps) {
        var ev = $.Event(type, eventProps)
        root.trigger(ev)
        return this
      },

      syntheticMouseEvent: function(type, x, y, overrideEl) {
        var el
        if(overrideEl) {
          el = overrideEl
        } else {
          el = root[0]
        }

        if(!x && !y) {
          x = y = 0
        }

        var ev = document.createEvent('MouseEvent')
        ev.initMouseEvent(
          type,
          true /* bubble */, true /* cancelable */,
          window, null,
          x, y, x, y, /* coordinates */
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
        if(arguments.length > 0) root.val(value).trigger('change')
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

      text: function(selector, nth, options) {
        var el = root
        if(selector) el = root.find(selector)
        if(!options && nth && !angular.isNumber(nth)) options = nth
        if(nth != null && angular.isNumber(nth)) el = el.eq(nth)

        if(options && options.normalize === false) {
          return el.text()
        } else {
          return normalizeText(el.text())
        }
      },

      normalizeText: normalizeText

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
.factory('JsDataFabricator', ["Fabricator", "$injector", "baseResourceFinder", function (
  Fabricator,
  $injector,
  baseResourceFinder
) {

  // We do this to avoid requiring Js-Data in the 'jdalt.toolBox' module
  if(!$injector.has('DS')) {
    throw new Error('JsDataFabricator requires JsData "DS" provider')
  }
  var DS = $injector.get('DS')

  function JsDataFabricator(fabName, params) {
    var fabObj = Fabricator(fabName, params)

    var resourceName = baseResourceFinder(fabName).name

    return DS.inject(resourceName, fabObj)
  }

  return JsDataFabricator

}])

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

    $get: ["$httpBackend", "$backportedParamSerializer", "Fabricator", "$injector", "baseResourceFinder", function (
      $httpBackend,
      $backportedParamSerializer,
      Fabricator,
      $injector,
      baseResourceFinder
    ) {

      var DSHttpAdapter
      var resourceDefs = {}
      if($injector.has('DS') && $injector.has('DS')) {
        var DS = $injector.get('DS')
        DSHttpAdapter = $injector.get('DSHttpAdapter')
        resourceDefs = DS.definitions
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
        return /^(https?:)?\//i.test(def)
      }

      function urlFromPath(method, path, params) {
        if(method === 'find') {
          return path + '/' + params
        } else {
          return path + queryString(params)
        }
      }

      function completePath(method, path, params) {
        if(method === 'findAll') {
          return path + queryString(params)
        } else {
          return path
        }
      }

      function getUrl(method, def, params) {
        if(isPath(def)) return urlFromPath(method, def, params)
        if(!DSHttpAdapter) return urlFromPath(method, def, params)

        var resourceBase = baseResourceFinder(def)
        var path = DSHttpAdapter.getPath(method, resourceBase, params, { params: params })

        return completePath(method, path, params) // params gets mutated by getPath, parent params (for nested routes) get stripped out when they are used
      }

      function omit(sourceObj, keys) {
        var result = angular.copy(sourceObj)
        keys.forEach(function(key) {
          delete result[key]
        })
        return result
      }

      // Transforms to update/upsert resource request (in contrast to url request) form
      function transformUpdateRequest(def, id, req, res) {
        if(!isPath(def)) {
          var resource = baseResourceFinder(def)
          var overwriteResp = req
          res = id
          id = res.id
          req = omit(res, resource.omit)
          if(overwriteResp) {
            res = responseTransformer(overwriteResp)
          } else {
            res = responseTransformer(req)
          }
        }
        return {
          id: id,
          req: req,
          res: res
        }
      }

      function getDefinition(type, method, url /*, data */) {
        if (!definitions[type][method][url]) { // TODO: serialize data when/if this is expanded to other methods
          definitions[type][method][url] = $httpBackend[type](method, url /*, data */)
        }
        return definitions[type][method][url]
      }

      // TODO: expand this out into `expect` and other methods, when/if it's useful
      var definitions = {
        when: {
          GET: {}
        }
      }

      return {
        flush: $httpBackend.flush,

        definitions: definitions,

        expectMany: function(def, params, res, overwriteParams) {
          if(!isPath(def) && typeof res == 'undefined')  res = []
          checkArray(def, res)
          var url = getUrl('findAll', def, params)
          var resObjs = manyFabricated(def, res)
          if(!isPath(def)) resObjs = responseTransformer(resObjs)

          if(overwriteParams) {
            angular.merge(resObjs, overwriteParams)
          }

          return $httpBackend.expectGET(url).respond(200, resObjs)
        },

        whenMany: function(def, params, res, overwriteParams) {
          if(!isPath(def) && typeof res == 'undefined')  res = []
          checkArray(def, res)
          var url = getUrl('findAll', def, params)
          var resObjs = manyFabricated(def, res)
          if(!isPath(def)) resObjs = responseTransformer(resObjs)

          if(overwriteParams) {
            angular.merge(resObjs, overwriteParams)
          }

          return getDefinition('when', 'GET', url).respond(200, resObjs)
        },

        expectOne: function(def, id, res) {
          // Handle as (def, res) vs (def, id, res)
          if(angular.isObject(id)) res = id
          var resObj = fabricated(def, res)
          if(angular.isObject(id) || (id == null  && res == null) ) id = resObj.id
          if(!isPath(def)) resObj = responseTransformer(resObj)

          var url = getUrl('find', def, id)
          return $httpBackend.expectGET(url).respond(200, resObj)
        },

        whenOne: function(def, id, res) {
          // Handle as (def, res) vs (def, id, res)
          if(angular.isObject(id)) res = id
          var resObj = fabricated(def, res)
          if(angular.isObject(id) || (id == null  && res == null) ) id = resObj.id
          if(!isPath(def)) resObj = responseTransformer(resObj)

          var url = getUrl('find', def, id)
          return getDefinition('when', 'GET', url).respond(200, resObj)
        },

        // raw: function(url, req, res)
        // resource: function(def, resp)
        expectCreate: function(def, req, res) {
          if(!isPath(def)) {
            req = angular.copy(req)
            if(res) {
              res = responseTransformer(res)
            } else {
              res = responseTransformer(angular.copy(req))
              delete req.id
            }
          }
          var url = getUrl('findAll', def)
          return $httpBackend.expectPOST(url, req).respond(200, res)
        },

        // raw: function(url, id, req, res)
        // resource: function(def, resp)
        expectUpdate: function(def, id, req, res) {
          var desc = transformUpdateRequest(def, id, req, res)
          var url = getUrl('find', def, desc.id)
          return $httpBackend.expectPUT(url, desc.req).respond(200, desc.res)
        },

        // raw: function(url, id, req, res)
        // resource: function(def, resp)
        expectUpsert: function(def, id, req, res) {
          var desc = transformUpdateRequest(def, id, req, res)
          var url = getUrl('find', def, desc.id)
          return $httpBackend.expectPATCH(url, desc.req).respond(200, desc.res)
        },

        expectDestroy: function(def, id) {
          var url = getUrl('find', def, id)
          return $httpBackend.expectDELETE(url).respond(204, '')
        },
      }
    }]
  }

})
