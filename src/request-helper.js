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

      // Recursively climbs tree of Fabricators via $parent and then retrieves resource definition for base parent.
      function getBaseResourceDef(def) {
        var fab = Fabricator(def)
        var resourceName = def

        if(!fab || !resourceName) throw new Error('Unable to find path for resource ' + def)

        while(fab.$parent) {
          resourceName = fab.$parent
          fab = Fabricator(resourceName)
        }

        return resourceDefs[resourceName]
      }

      function getUrl(method, def, params) {
        if(isPath(def)) return urlFromPath(method, def, params)
        if(!DSHttpAdapter) return urlFromPath(method, def, params)

        var resourceBase = getBaseResourceDef(def)
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
          var resource = resourceDefs[def]
          res = id
          id = res.id
          req = omit(res, resource.omit)
          res = responseTransformer(req)
        }
        return {
          id: id,
          req: req,
          res: res
        }
      }

      return {
        flush: $httpBackend.flush,

        expectMany: function(def, params, res, overwriteParams) {
          if(!isPath(def) && typeof res == 'undefined')  res = []
          checkArray(def, res)
          var url = getUrl('findAll', def, params)
          var resObjs = manyFabricated(def, res)
          if(!isPath(def)) resObjs = responseTransformer(resObjs)

          if(overwriteParams) {
            angular.merge(resObjs, overwriteParams)
          }

          $httpBackend.expectGET(url).respond(200, resObjs)
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

        // raw: function(url, req, res)
        // resource: function(def, resp)
        expectCreate: function(def, req, res) {
          if(!isPath(def)) {
            req = angular.copy(req)
            res = responseTransformer(angular.copy(req))
            delete req.id
          }
          var url = getUrl('findAll', def)
          $httpBackend.expectPOST(url, req).respond(200, res)
        },

        // raw: function(url, id, req, res)
        // resource: function(def, resp)
        expectUpdate: function(def, id, req, res) {
          var desc = transformUpdateRequest(def, id, req, res)
          var url = getUrl('find', def, desc.id)
          $httpBackend.expectPUT(url, desc.req).respond(200, desc.res)
        },

        // raw: function(url, id, req, res)
        // resource: function(def, resp)
        expectUpsert: function(def, id, req, res) {
          var desc = transformUpdateRequest(def, id, req, res)
          var url = getUrl('find', def, desc.id)
          $httpBackend.expectPATCH(url, desc.req).respond(200, desc.res)
        },

        expectDestroy: function(def, id) {
          var url = getUrl('find', def, id)
          $httpBackend.expectDELETE(url).respond(204, '')
        },
      }
    }
  }

})
