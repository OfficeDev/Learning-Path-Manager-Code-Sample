(function () {
  'use strict';

  // define service
  var serviceId = 'angular.config';
  angular.module('app').factory(serviceId,
    ['$http', 'common', configAngular]);

  function configAngular($http, common) {
    // init factory
    init();

    // service public signature
    return {};

    // init factory
    function init() {
      // set common $http headers
      $http.defaults.headers.common.Accept = 'application/json;odata=verbose';

      common.logger.log("service loaded", null, serviceId);
    }
  }

})();