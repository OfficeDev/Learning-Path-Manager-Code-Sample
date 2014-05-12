(function () {
  'use strict';

  // create module
  var commonModule = angular.module('common', []);

  // create provider
  commonModule.provider('commonConfig', function () {
    this.config = {};

    this.$get = function () {
      return {
        config: this.config
      };
    };
  });

  commonModule.factory('common',
    ['$q', '$rootScope', '$timeout', 'commonConfig', 'logger', common]);

  // create the factory 'common'
  function common($q, $rootScope, $timeout, commonConfig, logger) {
    var service = {
      // passthough common angular dependencies
      $broadcast: $broadcast,
      $q: $q,
      $timeout: $timeout,
      // my services
      logger: logger,
      activateController: activateController
    };

    return service;

    // passthrough of the angular $broadcast service
    function $broadcast() {
      return $rootScope.$broadcast.apply($rootScope, arguments);
    }

    // global function used to activate a controller once all promises have completed
    function activateController(promises, controllerId) {
      return $q.all(promises).then(function(eventArgs) {
        var data = { controllerId: controllerId };
        $broadcast(commonConfig.config.controllerActivateSuccessfulEvent, data);
        // hide the workingOnIt animation
        $broadcast(commonConfig.config.workingOnItToggleEvent, { show: false });
      });
    }
  }
})();