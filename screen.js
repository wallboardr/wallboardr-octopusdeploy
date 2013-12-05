define(['jquery', 'boards/data-loader', 'require', './admin'], function ($, dataLoader, require) {
  'use strict';
  var plugin = require('./admin'),
      makeRequest = function (url, data) {
        url = data.url + '/api' + url + '?apikey=' + data.apiKey;
        return dataLoader({
          url: url,
          proxy: true
        });
      },
      getDeployments = function (data) {
        var partial = '/projects/' + data.projectId + '/most-recent-deployment';
        return makeRequest(partial, data).then(function (deps) {
          var normalized = $.map(deps, function (dep) {
            return {
              environment: dep.Name.substr(10),
              version: dep.ReleaseVersion.substr(5),
              date: dep.Task.CompletedTime.substr(0, 10)
            };
          });

          return {deploys: normalized};
        });
      },
      octoScreen = function () {
        var self = this,
            viewData;
        return {
          getViewData: function () {
            return getDeployments(self.props.data).then(function (data) {
              data.title = self.props.name;
              return data;
            });
          },
          preShow: function () {
            self.maximizeTextSize();
          }
        };
      };

  octoScreen.config = plugin.config;
  return octoScreen;
});