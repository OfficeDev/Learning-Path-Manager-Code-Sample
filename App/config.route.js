(function () {
  'use strict';

  var app = angular.module('app');

  // get all the routes
  app.constant('routes', getRoutes());

  // config routes & their resolvers
  app.config(['$routeProvider', 'routes', routeConfigurator]);

  function routeConfigurator($routeProvider, routes) {
    routes.forEach(function (route) {
      $routeProvider.when(route.url, route.config);
    });

    $routeProvider.otherwise({ redirectTo: '/' });
  }

  // build the routes
  function getRoutes() {
    return [
      {
        url: '/',
        config: {
          templateUrl: 'app/dashboard/dashboard.html',
          title: 'dashboard',
          settings: {
            nav: 0,
            content: 'dashboard',
            quickLaunchEnabled: false
          }
        }
      },
      {
        url: '/LearningPaths',
        config: {
          templateUrl: 'app/learningPath/learningPaths.html',
          title: 'learning paths',
          settings: {
            nav: 1,
            content: 'Learning Paths',
            quickLaunchEnabled: true
          }
        }
      },
      {
        url: '/LearningPaths/:id',
        config: {
          templateUrl: 'app/learningPath/learningPathsDetail.html',
          title: 'learning paths',
          settings: {
            nav: 1.1,
            content: 'Learning Path Detail',
            quickLaunchEnabled: false
          }
        }
      },
      {
        url: '/LearningPaths/:learningPathId/Items',
        config: {
          templateUrl: 'app/learningItem/learningItems.html',
          title: 'learning paths items',
          settings: {
            nav: 1.2,
            content: 'Learning Path Items',
            quickLaunchEnabled: false
          }
        }
      },
      {
        url: '/LearningPaths/:learningPathId/submitreview',
        config: {
          templateUrl: 'app/workflowform/initform.html',
          title: 'workflow initialization form',
          settings: {
            nav: 1.3,
            content: 'Submit Learning Path for Review',
            quickLaunchEnabled: false
          }
        }
      },
      {
        url: '/LearningItems',
        config: {
          templateUrl: 'app/learningItem/learningItems.html',
          title: 'learning items',
          settings: {
            nav: 2,
            content: 'Learning Items',
            quickLaunchEnabled: true
          }
        }
      },
      {
        url: '/LearningItems/:id',
        config: {
          templateUrl: 'app/learningItem/learningItemsDetail.html',
          title: 'learning items',
          settings: {
            nav: 2.1,
            content: 'Learning Item Detail',
            quickLaunchEnabled: false
          }
        }
      }

    ];
  }
})();