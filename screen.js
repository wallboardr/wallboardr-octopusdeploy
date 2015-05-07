define(['jquery', 'boards/data-loader', 'require', './admin'], function ($, dataLoader, require) {
  'use strict';
  var plugin = require('./admin'),
      api = plugin.config.api,
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
            ppRegex = /(\d+)(\.\d+\.\d+)/,
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
          matches = ppRegex.exec(v);
          if (matches) {
            sprint = 'S' + matches[1];
            extra = matches[2];
          } else {
            sprint = '??';
          }
        }
        return {sprint: sprint, release: extra};
      },
      parseDate = function (dep) {
        var dStr, matches;
        if (dep.State === 'Failed') {
          return 'Failed';
        }
        if (!dep.CompletedTime || dep.State === 'Executing' || dep.State === 'Paused') {
          return 'Now';
        }
        dStr = dep.CompletedTime.substr(0, 10);
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
      mapToKeyedArray = function (keyName, arr) {
        var ii, obj = {};
        if (!arr) {
          return obj;
        }
        for (ii = 0; ii < arr.length; ii += 1) {
          obj[arr[ii][keyName]] = arr[ii];
        }
        return obj;
      },
      mapToHashset = function (arr) {
        var ii, obj = {};
        for (ii = 0; ii < arr.length; ii += 1) {
          if (arr[ii]) {
            obj[arr[ii]] = true;
          }
        }
        return obj;
      },
      reverseDeploys = function (a, b) {
        if (a.sort < b.sort) {
          return 1;
        } else if (a.sort > b.sort) {
          return -1;
        }
        return 0;
      },
      notExcluded = function (data, item) {
        return !data.excludeEnvsHash[item];
      },
      handleData = function (data, version) {
        return ({
          v1: function (deps) {
            var normalized = $.map(deps, function (dep) {
              return {
                environment: parseEnvironment(dep.Name),
                version: parseVersion(dep.ReleaseVersion),
                date: parseDate(dep.Task)
              };
            });

            return {deploys: normalized};
          },
          v2: function (dash) {
            var envLookup = mapToKeyedArray('Id', dash.Environments),
                deploys = [],
                ii;
            data.excludeEnvs = data.excludeEnvs || '';
            data.excludeEnvsHash = mapToHashset(data.excludeEnvs.split(/\s*,\s*/));
            if (!dash.Environments || !dash.Items) {
              return { deploys: deploys };
            }
            for (ii = 0; ii < dash.Items.length; ii += 1) {
              if (dash.Items[ii].ProjectId === data.projectId &&
                notExcluded(data, envLookup[dash.Items[ii].EnvironmentId].Name)) {
                deploys.push({
                  environment: envLookup[dash.Items[ii].EnvironmentId].Name,
                  version: parseVersion(dash.Items[ii].ReleaseVersion),
                  date: parseDate(dash.Items[ii]),
                  sort: dash.Items[ii].CompletedTime || envLookup[dash.Items[ii].EnvironmentId].Name
                });
              }
            }
            deploys.sort(reverseDeploys);
            return { deploys: deploys };
          }
        })[version];
      },
      getDeployments = function (data) {
        var apiVer = api.getVersion(data),
            partial = apiVer.deployments(data);
        return makeRequest(partial, data).then(handleData(data, apiVer.version));
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