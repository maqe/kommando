'use strict';

// require('colors');
var async = require('async');
var url = require('url');
var wd = require('wd');

var colors = require('colors');
// var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('./test-results/results.log'), 'results');
// var logger = log4js.getLogger('results');

module.exports = function(seleniumUrl) {
  return {
    clients: {},
    create: function(capabilities, callback) {
      var client = wd.promiseChainRemote(url.parse(seleniumUrl));

      client.on('status', function(info) {
        // logger.info(info);
        console.log(info.cyan);
      });
      client.on('command', function(eventType, command, response) {
        // logger.info(eventType, command, (response || ''));
        console.log(' > ' + eventType.cyan, command, (response || '').grey);
      });
      client.on('http', function(meth, path, data) {
        // logger.info(meth, path, (data || ''));
        console.log(' > ' + meth.magenta, path, (data || '').grey);
      });

      client.init(capabilities, function(error, sessionId) {
        this.clients[sessionId] = client;
        if (typeof callback === 'function') {
          callback(error, client, {
            wd: wd
          });
        }
      }.bind(this));
    },
    end: function(callback) {
      var client;
      var quitFunctions = [];

      for (var id in this.clients) {
        client = this.clients[id];
        delete this.clients[id];
        quitFunctions.push(client.quit.bind(client));
      }
      async.series(quitFunctions, callback);
    }
  };
};
