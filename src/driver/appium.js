var driverLauncher = require('../driver-launcher.js');

var address = require('address');
var freeport = require('freeport');

module.exports = function(config) {

  return {
    _launcher: null,
    _seleniumUrl: '',
    create: function(callback) {
      console.log('Starting Appium server ...');

      freeport(function(err, port) {
        var options = {
          args: [
            '--port', port
          ],
          hostname: address.ip() || address.ip('lo'),
          port: port,
          path: '/wd/hub'
        }
        this._launcher = driverLauncher(config.appiumPath || 'appium', options).start(function(error, url) {
          console.log('Appium server started at: ' + url);
          this._seleniumUrl = url;
          callback(error, url, {});
        }.bind(this));

      }.bind(this));
    },
    end: function(results, callback) {
      console.log('Shutting down Appium server at: ' + this._seleniumUrl);
      this._launcher.stop(callback);
    }
  };

};
