(function () {
  'use strict';

  // define controller
  var controllerId = 'workingonit';
  angular.module('app').controller(controllerId,
    ['$rootScope', 'common', 'config', workingonit]);

  function workingonit($rootScope, common, config) {
    var vm = this;

    vm.isWorking = true;

    init();

    function init() {
      common.logger.log("controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // wire handler to listen for toggling the working animation
    //    call it like this:
    //      common.$broadcast(commonConfig.config.workingOnItToggleEvent, {show: false});
    $rootScope.$on(config.events.workingOnItToggle, function (event, data) {
      common.logger.log('toggle working on it', data, controllerId);
      vm.isWorking = data.show;
    });

    // wire handler when route is changing to show
    //  working animation
    $rootScope.$on('$routeChangeStart',
      function (event, next, current) {
        common.logger.log('$routeChangeStart', event, controllerId);
        vm.isWorking = true;
      });

  }
})();