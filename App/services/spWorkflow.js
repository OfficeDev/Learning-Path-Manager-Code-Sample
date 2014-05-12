(function () {
  'use strict';

  // define service
  var serviceId = 'spWorkflow';
  angular.module('app').factory(serviceId,
  ['$q', 'common', 'datacontext', spWorkflow]);

  function spWorkflow($q, common, datacontext) {
    var spClientContext,
      wfServiceManager,
      wfDeploymentService,
      wfSubscriptionService,
      wfInstanceService = undefined;
    var learningPathListId = undefined;
    var wfDefinitionId = undefined;
    var wfSubscription = undefined;
    var wfSubscriptionId = undefined;

    // init factory
    init();

    return {
      startWorkflowOnListItem: startWorkflowOnListItem
    };

    // starts a workflow on a specific list item
    function startWorkflowOnListItem(listItemId, wfStartParams) {
      var deferred = $q.defer();

      // store async promises that don't have to happen in order
      var promises = [];

      // connect to sharepoint
      promises.push(connectToSharePoint());
      // get the learning path list id
      promises.push(datacontext.getLearningPathListId());

      // when they finish..
      $q.all(promises)
        .then(function (responses) {
          // get connections to all the services
          spClientContext = responses[0].spClientContxt;
          wfServiceManager = responses[0].wfServiceManager;
          wfDeploymentService = responses[0].wfDeploymentService;
          wfSubscriptionService = responses[0].wfSubscriptionService;
          wfInstanceService = responses[0].wfInstanceService;

          // get list id
          learningPathListId = responses[1].learningPathListId;
        })
        .then(function () {
          // get the workflow definition & subscription id's
          getWorkflowDefinitionId()
            .then(function (wfdResponse) {
              wfDefinitionId = wfdResponse.wfDefinitionId;

              // get the workflow subscription id
              getWorkflowSubscription(learningPathListId, wfDefinitionId)
                .then(function (wfsResponse) {
                  wfSubscription = wfsResponse.wfSubscription;
                  wfSubscriptionId = wfsResponse.wfSubscriptionId;

                  // start the workflow
                  startWorkflow(wfSubscription, listItemId, wfStartParams)
                    .then(function () {
                      common.logger.logSuccess('Started workflow.', null, serviceId);
                    deferred.resolve();
                  }).catch(function(error) {
                    common.logger.logError('Error starting workflow.', error, serviceId);
                    deferred.reject(error);
                  });
                })
                .catch(function (error) {
                  common.logger.logError('Error obtaining WF subscription ID.', error, serviceId);
                  deferred.resolve(error);
                });
            })
            .catch(function (error) {
              common.logger.logError('Error obtaining WF definision ID.', error, serviceId);
              deferred.resolve(error);
            });
        })
      .then(function () {
        common.logger.log('got everything we need');
      });



      return deferred.promise;
    }

    //#region private members
    // init factory
    function init() {
      common.logger.log('service loaded', null, serviceId);
    }

    // establish connection to sharepoint workflow service
    function connectToSharePoint() {
      var deferred = $q.defer();

      // check if already connected...
      if (wfServiceManager !== undefined || wfDeploymentService !== undefined ||
        wfSubscriptionService !== undefined || wfInstanceService !== undefined) {
        common.logger.log('reusing wf services', null, serviceId);
        deferred.resolve({
          spClientContxt: spClientContxt,
          wfServiceManager: wfServiceManager,
          wfDeploymentService: wfDeploymentService,
          wfSubscriptionService: wfSubscriptionService,
          wfInstanceService: wfInstanceService
        });
      } else { // else if not connected, connect
        // init
        var spcc = new SP.ClientContext.get_current();
        var wfsm = SP.WorkflowServices.WorkflowServicesManager.newObject(spcc, spcc.get_web());
        var wfds = wfsm.getWorkflowDeploymentService();
        var wfss = wfsm.getWorkflowSubscriptionService();
        var wfis = wfsm.getWorkflowInstanceService();

        // obtain references from SharePoint
        spcc.load(wfss);
        spcc.load(wfis);
        spcc.executeQueryAsync(function (response) {
          common.logger.log('retrieved connections to wf services', response, serviceId);
          deferred.resolve({
            spClientContxt: spcc,
            wfServiceManager: wfsm,
            wfDeploymentService: wfds,
            wfSubscriptionService: wfss,
            wfInstanceService: wfis
          });
        }, function (error) {
          common.logger.logError('Error retrieving connections to workflow services', error, serviceId);
          deferred.reject(error);
        });
      }
      return deferred.promise;
    }

    // find the specific workflow definition id
    function getWorkflowDefinitionId() {
      var deferred = $q.defer();

      // if already found the definisiondefinition
      if (wfDefinitionId) {
        //  THEN returned the cached version
        deferred.resolve({ wfDefinitionId: wfDefinitionId });
      } else {
        //  ELSE fetch from SharePoint

        // get all workflow definitions
        var wfDefinitions = wfDeploymentService.enumerateDefinitions(true);
        spClientContext.load(wfDefinitions);
        spClientContext.executeQueryAsync(function () {
          // look for a specific WF name
          var wfId = undefined;
          var enumerator = wfDefinitions.getEnumerator();
          while (enumerator.moveNext()) {
            if (enumerator.get_current().get_displayName() === 'Approve Learning Path Workflow') {
              wfId = enumerator.get_current().get_id().toString();
              break;
            }
          }

          // if found...
          if (wfId) {
            common.logger.log('retrieved wf definition id', wfId, serviceId);
            deferred.resolve({ wfDefinitionId: wfId });
          } else {
            deferred.reject({ errorMessage: 'unable to find workflow definition for workflow named \'Approve Learning Path Workflow\'' });
          }
        });
      }

      return deferred.promise;
    }

    // find a specific workflow subscription ID on a list for a specific definition
    function getWorkflowSubscription(listId, wfDefinitionId) {
      var wfSub = undefined;
      var wfSubId = undefined;
      var deferred = $q.defer();

      // if already found the subscription id
      if (wfSubscriptionId) {
        //  THEN return the cached version
        deferred.resolve({ wfSubscriptionId: wfSubscriptionId });
      } else {
        //  ELSE fetch from SharePoint

        // get all workflow subscriptions
        var wfSubscriptions = wfSubscriptionService.enumerateSubscriptionsByList(listId);
        spClientContext.load(wfSubscriptions);
        spClientContext.executeQueryAsync(function () {
          // look for the subscription
          var enumerator = wfSubscriptions.getEnumerator();
          while (enumerator.moveNext()) {
            if (enumerator.get_current().get_definitionId().toString() === wfDefinitionId) {
              wfSub = enumerator.get_current();
              wfSubId = enumerator.get_current().get_id().toString();
              break;
            }
          }

          // if found...
          if (wfSubId) {
            common.logger.log('retrieved wf subscription id', wfSubId, serviceId);
            deferred.resolve({
              wfSubscriptionId: wfSubId,
              wfSubscription: wfSub
            });
          } else {
            deferred.reject({ errorMessage: 'unable to find workflow subscription for workflow named \'Approve Learning Path Workflow\' on listID \'' + listId + '\'' });
          }
        });
      }

      return deferred.promise;
    }

    // start the workflow
    function startWorkflow(wfSubscription, listItemId, wfStartParams) {
      var deferred = $q.defer();

      // start the workflow
      wfInstanceService.startWorkflowOnListItem(wfSubscription, listItemId, wfStartParams);
      spClientContext.executeQueryAsync(function() {
        deferred.resolve();
      }, function(sender, args) {
        deferred.reject(args);
      });

      return deferred.promise;
    }
    //#endregion
  }
})();