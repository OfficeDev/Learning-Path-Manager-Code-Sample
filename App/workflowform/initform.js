(function () {
  'use strict';

  // define controller
  var controllerId = 'initform';
  angular.module('app').controller(controllerId,
    ['$window','$location', '$routeParams', 'common', 'spWorkflow', initform]);

  // create controller
  function initform($window, $location, $routeParams, common, spWorkflow) {
    var vm = this;
    // navigate backwards in the history stack
    vm.goBack = goBack;
    // start the workflow
    vm.startWorkflow = startWorkflow;

    // init controller
    init();

    // init controller
    function init() {
      initializePeoplePicker('peoplePickerDiv');

      common.logger.log("controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // start the workflow
    function startWorkflow() {
      // verify a user is selected
      var userLoginName = getUserLoginName();

      // if no user selected
      if (!userLoginName || userLoginName.length === 0) {
        //  THEN show warning notification that they have to select a user
        common.logger.logWarning('You must specify a user', null, controllerId);
      } else {
        //  ELSE start the workflow

        var wfParameters = new Object();
        wfParameters['ApproverLoginName'] = userLoginName;

        var learningPathId = +$routeParams.learningPathId;
        if (learningPathId && learningPathId > 0) {
          // start workflow
          spWorkflow.startWorkflowOnListItem(learningPathId, wfParameters);
          // notify user & redirect to the learning path list page
          $location.path('/LearningPaths/');
        }
      }
    }

      // setup the people picker
      function initializePeoplePicker(peoplePickerElementId) {
        // set config options on the people picker
        var schema = {};
        schema['PrincipalAccountType'] = 'User';
        schema['SearchPrincipalSource'] = 15;
        schema['ResolvePrincipalSource'] = 15;
        schema['AllowMultipleValues'] = false;
        schema['MaximumEntitySuggestions'] = 50;
        schema['Width'] = '280px';

        // Render and initialize the picker.  
        SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
      }

      // query the picker for user information. 
      function getUserLoginName() {
        // Get the people picker object from the page. 
        var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict.peoplePickerDiv_TopSpan;

        // Get user keys. 
        return peoplePicker.GetAllUserKeys();
      }

      // navigate backwards
      function goBack() {
        $window.history.back();
      }

    }
  })();