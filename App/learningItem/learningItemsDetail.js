(function () {
  'use strict';

  // define controller
  var controllerId = "learningItemsDetail";
  angular.module('app').controller(controllerId,
    ['$window', '$location', '$routeParams', 'common', 'datacontext', learningItemsDetail]);

  // create controller
  function learningItemsDetail($window, $location, $routeParams, common, datacontext) {
    var vm = this;
    // utility method to convert universal time > local time using moment.js
    vm.created = localizedCreatedTimestamp;
    vm.modified = localizedModifiedTimestap;
    // navigate backwards in the history stack
    vm.goBack = goBack;
    // handle saves & deletes
    vm.goSave = goSave;
    vm.goDelete = goDelete;

    // initalize controller
    init();


    // initalize controller
    function init() {
      // load the itemtype selectors
      getItemTypeSelectors();
      // load the learning path selectors
      getLearningPathSelectors();

      // if an ID is passed in, load the item
      var learningItemId = +$routeParams.id;
      if (learningItemId && learningItemId > 0) {
        getItem(learningItemId);
      } else {
        createItem();
      }

      common.logger.log("controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // localized created time for the current item
    function localizedCreatedTimestamp() {
      if (vm.learningItem) {
        return moment(vm.learningItem.Created).format("M/D/YYYY h:mm A");
      } else {
        return '';
      }
    }

    // localized modified time for the current item
    function localizedModifiedTimestap() {
      if (vm.learningItem) {
        return moment(vm.learningItem.Created).format("M/D/YYYY h:mm A");
      } else {
        return '';
      }
    }

    // navigate backwards
    function goBack() {
      $window.history.back();
    }

    // handle save action
    function goSave() {
      datacontext.saveLearningItem(vm.learningItem)
        .then(function () {
          common.logger.logSuccess("Saved learning item.", null, controllerId);
        })
        .then(function () {
          goBack();
        });
    }

    // handle delete action
    function goDelete() {
      datacontext.deleteLearningItem(vm.learningItem)
        .then(function () {
          common.logger.logSuccess("Deleted learning item.", null, controllerId);
        })
        .then(function () {
          goBack();
        });
    }

    // load all item type options
    function getItemTypeSelectors() {
      datacontext.getItemTypeChoices()
        .then(function (data) {
          vm.itemTypes = data;
        });
    }

    // load all learning paths
    function getLearningPathSelectors() {
      datacontext.getLearningPathsPartials()
        .then(function (data) {
          vm.learningPaths = data;
        });
    }

    // create a new learning path item
    function createItem() {
      vm.learningPath = datacontext.createLearningItem();
    }

    // load the item specified in the route
    function getItem(learningItemId) {
      datacontext.getLearningItem(learningItemId)
        .then(function (data) {
          vm.learningItem = data;
        });
    }

  }

})();