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
    $scope.getOctoProjects = function (form) {
      if (form.$valid) {
        makeRequest('/projects', form).then(function (res) {
          if (res && res.status === 200 && res.data) {
            $scope.allprojects = res.data;
          }
        })
      }
    };
    $scope.chooseProject = function (form, id) {
      if (form.$valid) {
        form.data.projectId = id;
        $scope.addScreen(form);
      }
    };
    $scope.reset();
  };
  octopusController.$inject = ['$scope', 'dataLoader'];
  octopusController.config = {
    name: 'octopus',
    controller: 'OctopusController',
    humanName: 'Octopus Deploy',
    centered: true
  };

  return octopusController;
});