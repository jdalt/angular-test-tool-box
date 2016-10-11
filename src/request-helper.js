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

    $get: function (
      $httpBackend,
      $backportedParamSerializer,
      Fabricator,
      $injector
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
        return def[0] == '/'
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

        var resource = resourceDefs[def]
        if(!resource) throw new Error('Unable to find path for resource ' + def)

        var path = DSHttpAdapter.getPath(method, resource, params, { params: params })

        return completePath(method, path, params) // params gets mutated by getPath, parent params (for nested routes) get stripped out when they are used
      }

      return {
        flush: $httpBackend.flush,

        expectMany: function(def, params, res) {
          if(!isPath(def) && typeof res == 'undefined')  res = []
          checkArray(def, res)
          var url = getUrl('findAll', def, params)
          var resObjs = manyFabricated(def, res)
          if(!isPath(def)) resObjs = responseTransformer(resObjs)
          $httpBackend.expectGET(url).respond(200, resObjs)
        },

        whenMany: function(def, params, res) {
          if(!isPath(def) && typeof res == 'undefined')  res = []
          checkArray(def, res)
          var url = getUrl('findAll', def, params)
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

          var url = getUrl('find', def, id)
          $httpBackend.expectGET(url).respond(200, resObj)
        },

        whenOne: function(def, id, res) {
          // Handle as (def, res) vs (def, id, res)
          if(angular.isObject(id)) res = id
          var resObj = fabricated(def, res)
          if(angular.isObject(id) || (id == null  && res == null) ) id = resObj.id
          if(!isPath(def)) resObj = responseTransformer(resObj)

          var url = getUrl('find', def, id)
          $httpBackend.whenGET(url).respond(200, resObj)
        },

        // TODO: test fabrication for mutational methods, use correct method name to generate url
        expectCreate: function(def, req, res) {
          var url = getUrl('findAll', def)
          $httpBackend.expectPOST(url, req).respond(200, res)
        },

        expectUpdate: function(def, id, req, res) {
          var url = getUrl('find', def, id)
          $httpBackend.expectPUT(url, req).respond(200, res)
        },

        expectUpsert: function(def, id, req, res) {
          var url = getUrl('find', def, id)
          $httpBackend.expectPATCH(url, req).respond(200, res)
        },

        expectDestroy: function(def, id) {
          var url = getUrl('find', def, id)
          $httpBackend.expectDELETE(url).respond(204, '')
        },
      }
    }
  }

})
