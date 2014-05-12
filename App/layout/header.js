(function () {
  'use strict';

  // define controller
  var controllerId = 'header';
  angular.module('app').controller(controllerId,
    ['$rootScope', '$routeParams', '$route', 'common', 'config', headerController]);

  // init controller
  function headerController($rootScope, $routeParams, $route, common, config) {
    var vm = this;
    // homepage of the app
    vm.appHomeUrl = '/lpm/app.html';
    // app name
    vm.appTitle = config.title;
    // url of the icon to use for the app
    vm.appIconUrl = '';

    // init controller
    init();

    // init controller
    function init() {
      common.logger.log("controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // wire handler to successful route changes to
    //  - update the page title (for bookmarking)
    $rootScope.$on('$routeChangeSuccess',
      function (event, next, current) {
        if (!$route.current || !$route.current.title) {
          vm.currentPageTitle = '';
        } else if ($route.current.settings.nav > 0) {
          if ($routeParams.id == 'new') {
            vm.currentPageTitle = 'Create New Item';
          } else {
            vm.currentPageTitle = $route.current.settings.content;
          }
        } else {
          vm.currentPageTitle = '';
        }
      });
  }
})();