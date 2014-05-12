(function () {
  'use strict';

  // create app
  var app = angular.module('app', ['common', 'ngResource', 'ngCookies']);

  // configure angular logging service before startup
  app.config(['$logProvider', function ($logProvider) {
    // turn debugging off/on (no info or warn)
    if ($logProvider.debugEnabled) {
      $logProvider.debugEnabled(true);
    }
  }]);

  // create controller
  var controllerId = 'appLauncher';
  var loggerSource = '[' + controllerId + '] ';
  app.controller(controllerId,
    ['$log', 'common', 'spContext', appLauncher]);

  function appLauncher($log, common, spContext) {

    // init the controller
    init();

    function init() {
      $log.log(loggerSource, "controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }
  }
})();