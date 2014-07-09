'use strict';

var url = require('url');

var lodash = require('lodash');
var Promise = require('digdug/node_modules/dojo/Promise');
var DigdugTestingBotTunnel = require('digdug/TestingBotTunnel');

var merge = lodash.merge;

module.exports = function(options) {

  var jobState = options.jobState;
  delete options.jobState;

  return {
    _tunnel: null,
    updateCapabilities: function(caps) {
      return merge({}, this._tunnel.extraCapabilities, caps);
    },
    start: function(callback) {
      var tunnel = this._tunnel = new DigdugTestingBotTunnel(merge({
        tunnelId: Date.now()
      }, options));
      tunnel.start().then(function(error) {
        console.log('Using TestingBot selenium server at: ' + tunnel.clientUrl);
        callback(null, tunnel.clientUrl);
      }, function(error) {
        callback(error);
      });
    },
    stop: function(results, callback) {
      var sendJobStates = [];
      var tunnel = this._tunnel;
      results.forEach(function(result) {
        (result.clientIds || []).forEach(function(clientId) {
          sendJobStates.push(tunnel.sendJobState(clientId, merge({
            success: result.passed
          }, jobState)));
        });
      });
      Promise.all(sendJobStates).then(function() {
        return tunnel.stop();
      }).then(callback, callback);
    }
  };

};
