(function () {
  'use strict';

  var app = angular.module('app');

  var events = {
    // event when the controller has been successfully activated
    controllerActivateSuccess: 'controller.activateSuccess',
    // event when to toggle the working on it dialog
    workingOnItToggle: 'workingonit.toggle',
    // event when the security digest has been obtained and/or refreshed
    securityDigestRefreshed: 'spContext.digestRefreshed'
  };

  var config = {
    title: 'Learning Path Manager',
    // config the exceptionHandler decorator
    appErrorPrefix: '[SYSERR] ',
    // app events
    events: events,
    // app version
    version: '1.0.0.0',
    // debug notification settings
    showDebugNotiSetting: false
  };

  // create a global variable on app called 'config'
  app.value('config', config);

  // configure the angular logging service before startup
  app.config(['$logProvider', function ($logProvider) {
    // turn debugging off/on (no info or warn)
    if ($logProvider.debugEnabled) {
      $logProvider.debugEnabled(true);
    }
  }]);

  // configure the common configuration
  app.config(['commonConfigProvider', function (cfg) {
    // setup events
    cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
    cfg.config.workingOnItToggleEvent = config.events.workingOnItToggle;
    cfg.config.spContextSecurityDigestRefreshedEvent = config.events.securityDigestRefreshed;
  }]);
})();