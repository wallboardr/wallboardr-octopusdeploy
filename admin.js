define([], function () {
  'use strict';
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
      if (form.$valid) {
        makeRequest('/projects', active || form).then(function (res) {
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
    pollInterval: 120
  };

  return octopusController;
});