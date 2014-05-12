(function () {
  'use strict';

  // define controller
  var controllerId = 'shell';
  angular.module('app').controller(controllerId,
    ['$rootScope', '$route', 'common', 'config', shell]);

  // create controller
  function shell($rootScope, $route, common, config) {
    var vm = this;
    var logger = common.logger;

    // init controller
    init();

    // init controller
    function init() {
      logger.log("app shell loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // wire handler to successful route changes to
    //  - update the page title (for bookmarking)
    $rootScope.$on('$routeChangeSuccess',
      function (event, next, current) {
        if (!$route.current || !$route.current.title) {
          $rootScope.pageTitle = '';
        } else if ($route.current.settings.nav > 0) {
          $rootScope.pageTitle = ' > ' + $route.current.settings.content;
        } else {
          $rootScope.pageTitle = '';
        }

      });
  }

})();