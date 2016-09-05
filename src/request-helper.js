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

        expectDelete: function(def, id) {
          var url = getUrlOne(def, id)
          $httpBackend.expectDELETE(url).respond(204)
        },
      }
    }
  }

})
