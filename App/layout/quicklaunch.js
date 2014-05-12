(function () {
  'use strict';

  // define controller
  var controllerId = 'quicklaunch';
  angular.module('app').controller(controllerId,
    ['$route', 'config', 'common', 'routes', quickLaunch]);

  // init controller
  function quickLaunch($route, config, common, routes) {
    var vm = this;
    // utility method to see if the provided route is the current route
    vm.isCurrent = isCurrent;

    // init controller
    init();

    // init controller
    function init() {
      common.logger.log("controller loaded", null, controllerId);
      getNavigationRoutes();
    }

    // #region private members
    // load all navigatino routes
    function getNavigationRoutes() {
      // only retrieve routes flagged quickLaunchEnabled = true & sort them
      vm.navRoutes = routes.filter(function(route) {
        return route.config.settings && route.config.settings.nav && route.config.settings.quickLaunchEnabled;
      }).sort(function(routeA, routeB) {
        return routeA.config.settings.nav > routeB.config.settings.nav;
      });
    }

    // utility method to see if the provided route is the current route
    function isCurrent(route) {
      if (!route.config.title || !$route.current || !$route.current.title) {
        return '';
      }
      var menuName = route.config.title;
      return $route.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
    }
    // #endroute
  }
})();