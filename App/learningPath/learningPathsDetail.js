(function () {
  'use strict';

  // define controller
  var controllerId = "learningPathsDetail";
  angular.module('app').controller(controllerId,
    ['$window', '$location', '$routeParams', 'common', 'datacontext', learningPathsDetail]);

  // create controller
  function learningPathsDetail($window, $location, $routeParams, common, datacontext) {
    var vm = this;
    // utility method to convert universal time > local time using moment.js
    vm.created = localizedCreatedTimestamp;
    vm.modified = localizedModifiedTimestap;
    // navigate backwards in the history stack
    vm.goBack = goBack;
    // handle saves & deletes
    vm.goSave = goSave;
    vm.goDelete = goDelete;

    // init controller
    init();

    // init controller
    function init() {
      // if an ID is passed in, load the item
      var learningPathId = +$routeParams.id;
      if (learningPathId && learningPathId > 0) {
        getItem(learningPathId);
      } else {
        createItem();
      }

      common.logger.log("controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // localized created time for the current item
    function localizedCreatedTimestamp() {
      if (vm.learningPath) {
        return moment(vm.learningPath.Created).format("M/D/YYYY h:mm A");
      } else {
        return '';
      }
    }

    // localized modified time for the current item
    function localizedModifiedTimestap() {
      if (vm.learningPath) {
        return moment(vm.learningPath.Created).format("M/D/YYYY h:mm A");
      } else {
        return '';
      }
    }

    // navigate backwards in the history stack
    function goBack() {
      $window.history.back();
    }

    // handle save action
    function goSave() {
      datacontext.saveLearningPath(vm.learningPath)
        .then(function () {
          common.logger.logSuccess("Saved learning path.", null, controllerId);
        })
        .then(function () {
          $location.path('/LearningPaths/');
        });
    }

    // handle delete action
    function goDelete() {
      datacontext.deleteLearningPath(vm.learningPath)
        .then(function () {
          common.logger.logSuccess("Deleted learning path.", null, controllerId);
        })
        .then(function () {
          $location.path('/LearningPaths/');
        });
    }

    // create a new learning path item
    function createItem() {
      vm.learningPath = datacontext.createLearningPath();
    }

    // load the item specified in the route
    function getItem(learningPathId) {
      datacontext.getLearningPath(learningPathId)
        .then(function (data) {
          vm.learningPath = data;
        });
    }
  }

})();