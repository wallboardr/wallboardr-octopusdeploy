define([], function () {
  'use strict';
  var api = {
    v1: {
      projects: '/projects',
      deployments: function (data) {
        return '/projects/' + data.projectId + '/most-recent-deployment';
      },
      version: 'v1'
    },
    v2: {
      projects: '/projects/all',
      deployments: function () {
        return '/dashboard';
      },
      version: 'v2'
    },
    getVersion: function (data) {
      if (data.apiKey.indexOf('API-') === 0) {
        return this.v2;
      }
      return this.v1;
    }
  };
  var octopusController = function ($scope, dataLoader) {
    var makeRequest = function (url, form) {
      url = form.data.url + '/api' + url + '?apikey=' + form.data.apiKey;
      return dataLoader({
        url: url,
        proxy: true
      });
    };
    $scope.reset = function () {
      $scope.allprojects = [];
    };
    $scope.showProjects = function () {
      return $scope.allprojects && $scope.allprojects.length > 0;
    };
    $scope.getOctoProjects = function (form, active) {
      var dataLocation = active || form;
      if (form.$valid) {
        makeRequest(api.getVersion(dataLocation.data).projects, dataLocation).then(function (res) {
          $scope.allprojects = res;
        });
      }
    };
    $scope.projStatus = function (proj) {
      var classes = [];
      if ($scope.activeScreenEdit && $scope.activeScreenEdit.data && proj.Id === $scope.activeScreenEdit.data.projectId) {
        classes.push('is-active');
      }
      return classes;
    };
    $scope.chooseProject = function (form, id, active) {
      var dataLocation = active || form;
      if (form.$valid) {
        dataLocation.data.projectId = id;
        if (active) {
          $scope.updateActiveScreen(form);
        } else {
          $scope.addScreen(form);
        }
        $scope.reset();
      }
    };
    $scope.cancelEditScreen = function () {
      $scope.reset();
    };
    $scope.reset();
  };
  octopusController.$inject = ['$scope', 'dataLoader'];
  octopusController.config = {
    name: 'octopus',
    controller: 'OctopusController',
    humanName: 'Octopus Deploy',
    centered: true,
    pollInterval: 120,
    api: api
  };

  return octopusController;
});