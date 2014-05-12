/*
 * datacontext that uses the Anuglar $http service
 */

(function () {
  'use strict';

  // define factory
  var serviceId = 'datacontext';
  angular.module('app').factory(serviceId,
    ['$rootScope', '$http', '$resource', '$q', 'config', 'common', 'spContext', datacontext]);

  function datacontext($rootScope, $http, $resource, $q, config, common, spContext) {
    // init factory
    init();

    // service public signature
    return {
      getItemTypeChoices: getItemTypeChoices,
      // learning path members
      getLearningPathListId: getLearningPathListId,
      getLearningPathsPartials: getLearningPathsPartials,
      getLearningPath: getLearningPath,
      createLearningPath: createLearningPath,
      saveLearningPath: saveLearningPath,
      deleteLearningPath: deleteLearningPath,
      // learning item members
      getLearningItemsPartials: getLearningItemsPartials,
      getLearningItem: getLearningItem,
      createLearningItem: createLearningItem,
      saveLearningItem: saveLearningItem,
      deleteLearningItem: deleteLearningItem
    };

    // init service
    function init() {
      common.logger.log("service loaded", null, serviceId);
    }

    // get resourse to get learning item types available
    function getItemTypeResource() {
      return $resource('_api/web/lists/getbytitle(\'Learning Items\')/Fields',
       {},
       {
         get: {
           method: 'GET',
           params: {
             '$select': 'Choices',
             '$filter': 'InternalName eq \'ItemType\'',
             '$orderBy': 'Choices'
           },
           headers: {
             'Accept': 'application/json;odata=verbose;'
           }
         }
       });
    }

    // get the Learning Path angular resource reference
    function getLpListResource() {
      //   THEN build the resource to the specific item
      return $resource('_api/web/lists/getbytitle(\'Learning Paths\')',
      {},
      {
        get: {
          method: 'GET',
          params: {
            '$select': 'Id,Title,Description,DefaultView'
          },
          headers: {
            'Accept': 'application/json;odata=verbose;'
          }
        }
      });
    }

    // get the Learning Path angular resource reference
    function getLpResource(currentItem) {
      // if an ID is passed in, 
      //   ELSE create resource pointing to collection for a new item
      if (+currentItem.Id) {
        //   THEN build the resource to the specific item
        return $resource('_api/web/lists/getbytitle(\'Learning Paths\')/items(:itemId)',
        { itemId: currentItem.Id },
        {
          get: {
            method: 'GET',
            params: {
              '$select': 'Id,Title,OData__Comments,Created,Modified'
            },
            headers: {
              'Accept': 'application/json;odata=verbose;'
            }
          },
          post: {
            method: 'POST',
            headers: {
              'Accept': 'application/json;odata=verbose;',
              'Content-Type': 'application/json;odata=verbose;',
              'X-RequestDigest': spContext.securityValidation,
              'X-HTTP-Method': 'MERGE',
              'If-Match': currentItem.__metadata.etag
            }
          },
          delete: {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json;odata=verbose;',
              'Content-Type': 'application/json;odata=verbose;',
              'X-RequestDigest': spContext.securityValidation,
              'If-Match': '*'
            }
          }
        });
      } else {
        return $resource('_api/web/lists/getbytitle(\'Learning Paths\')/items',
          {},
          {
            post: {
              method: 'POST',
              headers: {
                'Accept': 'application/json;odata=verbose;',
                'Content-Type': 'application/json;odata=verbose;',
                'X-RequestDigest': spContext.securityValidation
              }
            }
          });
      }
    }

    // get the Learning Item angular resource reference
    function getLiResource(currentItem, learningPathIdFilter) {
      // if a learning item is passed in...
      if (currentItem) {
        //  THEN if the item has an ID
        if (+currentItem.Id) {
          //  THEN get the specific item
          return $resource('_api/web/lists/getbytitle(\'Learning Items\')/items(:itemId)',
          { itemId: currentItem.Id },
          {
            get: {
              method: 'GET',
              params: {
                '$select': 'Id,Title,ItemType,OData__Comments,Url,LearningPath/Id,Created,Modified',
                '$expand': 'LearningPath/Id'
              },
              headers: {
                'Accept': 'application/json;odata=verbose'
              }
            },
            post: {
              method: 'POST',
              headers: {
                'Accept': 'application/json;odata=verbose;',
                'Content-Type': 'application/json;odata=verbose;',
                'X-RequestDigest': spContext.securityValidation,
                'X-HTTP-Method': 'MERGE',
                'If-Match': currentItem.__metadata.etag
              }
            },
            delete: {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json;odata=verbose;',
                'Content-Type': 'application/json;odata=verbose;',
                'X-RequestDigest': spContext.securityValidation,
                'If-Match': '*'
              }
            }
          });
        } else {
          //  ELSE creating item...
          return $resource('_api/web/lists/getbytitle(\'Learning Items\')/items',
          {},
          {
            post: {
              method: 'POST',
              headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose;',
                'X-RequestDigest': spContext.securityValidation
              }
            }
          });
        }
      } else {
        // ELSE if an learning path ID filter is passed in, 
        if (learningPathIdFilter) {
          //   THEN build the resource filtering for a specific learning path
          //   ELSE create resource showing all items
          return $resource('_api/web/lists/getbytitle(\'Learning Items\')/items',
          {},
          {
            get: {
              method: 'GET',
              params: {
                '$select': 'LearningPath/Id,Id,Title,ItemType,OData__Comments,Url,Created,Modified',
                '$expand': 'LearningPath/Id',
                '$filter': 'LearningPath/Id eq ' + learningPathIdFilter
              },
              headers: {
                'Accept': 'application/json;odata=verbose;'
              }
            },
          });
        } else {
          return $resource('_api/web/lists/getbytitle(\'Learning Items\')/items',
          {},
          {
            get: {
              method: 'GET',
              headers: {
                'Accept': 'application/json;odata=verbose;'
              }
            }
          });
        }
      }
    }

    // get all item choices available
    function getItemTypeChoices() {
      // get resource
      var resource = getItemTypeResource();

      var deferred = $q.defer();
      resource.get({}, function (data) {
        deferred.resolve(data.d.results[0].Choices.results);
        common.logger.log("retrieved ItemType field choices", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("retrieved ItemType field choices", error, serviceId);
      });

      return deferred.promise;
    }

    // get learning path list ID
    function getLearningPathListId() {
      var deferred = $q.defer();

      // get resource
      var resource = getLpListResource();
      resource.get({}, function(data) {
        deferred.resolve({ learningPathListId: data.d.Id });
        common.logger.log("retrieved learning path id", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("retrieve learning path id", error, serviceId);
      });

      return deferred.promise;
    }

    // retrieve all learning paths, using ngHttp service
    function getLearningPathsPartials() {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: '_api/web/lists/getbytitle(\'Learning Paths\')/items?$select=Id,Title,OData__Comments,ApprovedState&$orderby=Title'
      }).success(function (data) {
        common.logger.log("retrieved LP partials via ngHttp", data, serviceId);
        deferred.resolve(data.d.results);
      }).error(function (error) {
        var message = "data context ngHttp error: " + error.message;
        common.logger.logError(message, error, serviceId);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    // gets a specific learning path
    function getLearningPath(id) {
      var lp = new lpm.models.learningPath();
      lp.Id = id;

      // get resource
      var resource = getLpResource(lp);

      var deferred = $q.defer();
      resource.get({}, function (data) {
        deferred.resolve(data.d);
        common.logger.log("retrieved learning path", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("retrieve learning path", error, serviceId);
      });

      return deferred.promise;
    }

    // creates a new learning path
    function createLearningPath() {
      return new lpm.models.learningPath();
    }

    // saves a learning path
    function saveLearningPath(learningPath) {
      // get resource
      var resource = getLpResource(learningPath);

      var deferred = $q.defer();

      resource.post(learningPath, function (data) {
        deferred.resolve(data);
        common.logger.log("save learning path", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("Save learning path", error, serviceId);
      });

      return deferred.promise;

    }

    // deletes a learning path
    function deleteLearningPath(learningPath) {
      // get resource
      var resource = getLpResource(learningPath);

      var deferred = $q.defer();

      // use angular $resource to delete the item
      resource.delete(learningPath, function (data) {
        deferred.resolve(data);
        common.logger.log("delete learning path", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("delete learning path", error, serviceId);
      });

      return deferred.promise;
    }

    // retrieve all learning paths, using ngHttp service
    function getLearningItemsPartials(learningPathIdFilter) {
      // get resource
      var resource = getLiResource(null, learningPathIdFilter);

      var deferred = $q.defer();
      resource.get({}, function (data) {
        deferred.resolve(data.d.results);
        common.logger.log("retrieved learning items partials", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("retrieved learning items partials", error, serviceId);
      });

      return deferred.promise;
    }

    // gets a specific learning item
    function getLearningItem(id) {
      var lp = new lpm.models.learningItem();
      lp.Id = id;

      // get resource
      var resource = getLiResource(lp);

      var deferred = $q.defer();
      resource.get({}, function (data) {
        deferred.resolve(data.d);
        common.logger.log("retrieved learning item", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("retrieve learning item", error, serviceId);
      });

      return deferred.promise;
    }

    // creates a new learning item
    function createLearningItem() {
      return new lpm.models.learningItem();
    }

    // saves a learning item
    function saveLearningItem(item) {
      // get resource
      var resource = getLiResource(item);

      // create save object
      var saveItem = new lpm.models.learningItem();
      saveItem.Title = item.Title;
      saveItem.ItemType = item.ItemType;
      saveItem.LearningPathId = item.LearningPath.Id;
      saveItem.Url = item.Url;
      saveItem.OData__Comments = item.OData__Comments;

      var deferred = $q.defer();

      resource.post(saveItem, function (data) {
        deferred.resolve(data);
        common.logger.log("save learning item", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("Save learning item", error, serviceId);
      });

      return deferred.promise;

    }

    // deletes a learning item
    function deleteLearningItem(item) {
      // get resource
      var resource = getLiResource(item);

      var deferred = $q.defer();

      // use angular $resource to delete the item
      resource.delete(item, function (data) {
        deferred.resolve(data);
        common.logger.log("delete learning item", data, serviceId);
      }, function (error) {
        deferred.reject(error);
        common.logger.logError("delete learning item", error, serviceId);
      });

      return deferred.promise;
    }
  }
})();