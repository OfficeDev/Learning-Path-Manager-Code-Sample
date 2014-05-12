(function () {
  'use strict';

  // define controller
  var controllerId = "learningItems";
  angular.module('app').controller(controllerId,
    ['$location', '$routeParams', 'common', 'datacontext', learningItems]);

  // create controller
  function learningItems($location, $routeParams, common, datacontext) {
    var vm = this;

    // navigate to the specified item
    vm.gotoItem = gotoItem;
    // build link to create new learning items
    vm.newLearningItemUrl = newLearningItemUrl;

    // init controller
    init();

    // load all learning items
    getLearningItems();

    function newLearningItemUrl() {
      var learningPathId = +$routeParams.learningPathId || 0;

      if (learningPathId && learningPathId > 0) {
        return '#/LearningPaths/' + learningPathId + '/Items/new';
      } else {
        return '#/LearningItems/new';
      }
    }

    // navigate to the specified item
    function gotoItem(learningItem) {
      if (learningItem && learningItem.Id) {
        $location.path('/LearningItems/' + learningItem.Id);
      }
    }

    // #region private memebers
    // init controller
    function init() {
      common.logger.log("controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // gets all learning items as partials (filtered if specified)
    function getLearningItems() {
      // get the learning path to filter on
      //  if not specified, this comes back as NaN which is 
      //  dealt with in the datacontext
      var learningPathId = +$routeParams.learningPathId;

      datacontext.getLearningItemsPartials(learningPathId)
        .then(function (data) {
          if (data) {
            vm.learningItems = data;
          } else {
            throw new Error('error obtaining data');
          }
        }).catch(function (error) {
          common.logger.logError('error obtaining learning items', error, controllerId);
        });
    }
  };

})();