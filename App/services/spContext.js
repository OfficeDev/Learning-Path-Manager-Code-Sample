(function () {
  'use strict';

  var serviceId = 'spContext';
  var loggerSource = '[' + serviceId + '] ';
  angular.module('app').service(serviceId, [
    '$log', '$cookieStore', '$window', '$location', '$resource', '$timeout', 'common', 'commonConfig', spContext]);

  function spContext($log, $cookieStore, $window, $location, $resource, $timeout, common, commonConfig) {
    var service = this;
    var spWeb = {
      url: '',
      title: '',
      logoUrl: ''
    };
    service.hostWeb = spWeb;

    // init the service
    init();

    // init... akin to class constructor
    function init() {
      $log.log(loggerSource, 'service loaded', null);

      // if values don't exist on querystring...
      if (decodeURIComponent($.getQueryStringValue("SPHostUrl")) === "undefined") {
        // load the app context form the cookie
        loadSpAppContext();

        // fire off automatic refresh of security digest
        refreshSecurityValidation();
      } else {
        // otherwise, creae the app context
        createSpAppContext();
      }
    }

    // create sharepoint app context by moving params on querystring to an app cookie
    function createSpAppContext() {
      $log.log(loggerSource, 'writing spContext cookie', null);
      var url = decodeURIComponent($.getQueryStringValue("SPHostUrl"));
      $cookieStore.put('SPHostUrl', url);

      var title = decodeURIComponent($.getQueryStringValue("SPHostTitle"));
      $cookieStore.put('SPHostTitle', title);

      var logoUrl = decodeURIComponent($.getQueryStringValue("SPHostLogoUrl"));
      $cookieStore.put('SPHostLogoUrl', logoUrl);


      $log.log(loggerSource, 'redirecting to app', null);
      var appUrl = $location.protocol() + "://" + $location.host() + "/lpm/app.html";
      $window.location.href = appUrl;
    }

    // init the sharepoint app context by loding the app's cookie contents
    function loadSpAppContext() {
      $log.log(loggerSource, 'loading spContext cookie', null);
      service.hostWeb.url = $cookieStore.get('SPHostUrl');
      service.hostWeb.title = $cookieStore.get('SPHostTitle');
      service.hostWeb.logoUrl = $cookieStore.get('SPHostLogoUrl');
    }

    // fire off automatic refresh of security digest
    function refreshSecurityValidation() {
      common.logger.log("refreshing security validation", service.securityValidation, serviceId);

      var siteContextInfoResource = $resource('_api/contextinfo?$select=FormDigestValue', {}, {
        post: {
          method: 'POST',
          headers: {
            'Accept': 'application/json;odata=verbose;',
            'Content-Type': 'application/json;odata=verbose;'
          }
        }
      });

      // request validation
      siteContextInfoResource.post({}, function (data) {
        // obtain security digest timeout & value & store in service
        var validationRefreshTimeout = data.d.GetContextWebInformation.FormDigestTimeoutSeconds - 10;
        service.securityValidation = data.d.GetContextWebInformation.FormDigestValue;
        common.logger.log("refreshed security validation", service.securityValidation, serviceId);
        common.logger.log("next refresh of security validation: " + validationRefreshTimeout + " seconds", null, serviceId);

        // broadcast event that the digest was obtained
        common.$broadcast(commonConfig.config.spContextSecurityDigestRefreshedEvent, {});

        // repeat this in FormDigestTimeoutSeconds-10
        $timeout(function () {
          refreshSecurityValidation();
        }, validationRefreshTimeout*1000);
      }, function (error) {
        common.logger.logError("response from contextinfo", error, serviceId);
      });


    }
  }
})();