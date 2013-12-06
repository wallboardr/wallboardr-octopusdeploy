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
      parseVersion = function (v) {
        var vRegex = /\d+\.(\d+)\.(\d+)(\.\d+|\-[a-z0-9]+)/,
            matches = vRegex.exec(v),
            sprint = '',
            extra = '';
        if (matches) {
          if (matches[3][0] === '-') {
            // Test release
            sprint = false;
          } else {
            sprint = 'S' + matches[2];
            extra = matches[3];
          }
        } else {
          sprint = '??';
        }
        return {sprint: sprint, release: extra};
      },
      parseDate = function (dep) {
        var dStr, matches;
        if (!dep.Task.CompletedTime || dep.Task.State === 'Executing' || dep.Task.State === 'Paused') {
          return 'Now';
        }
        dStr = dep.Task.CompletedTime.substr(0, 10);
        matches = /(\d{4}).(\d\d).(\d\d)/.exec(dStr);
        if (matches) {
          return matches[1] + '&#8209;' + matches[2] + '&#8209;' + matches[3];
        } else {
          return dStr;
        }
      },
      parseEnvironment = function (name) {
        var env = name.substr(10), matches = /^(.+)\s+\(#\d+\)/.exec(env);
        if (matches) {
          env = matches[1];
        }
        return env.replace(' ', '&nbsp;');
      },
      getDeployments = function (data) {
        var partial = '/projects/' + data.projectId + '/most-recent-deployment';
        return makeRequest(partial, data).then(function (deps) {
          var normalized = $.map(deps, function (dep) {
            return {
              environment: parseEnvironment(dep.Name),
              version: parseVersion(dep.ReleaseVersion),
              date: parseDate(dep)
            };
          });

          return {deploys: normalized};
        });
      },
      octoScreen = function () {
        var self = this;
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