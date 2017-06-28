'use strict';

var sensorDriver = require('../../index');
var midascon = require('../../midascon.js');
var Network = sensorDriver.Network;
var Device = sensorDriver.Device;
var util = require('util');
var _ = require('lodash');
var logger = Network.getLogger();

function refineDeviceId(deviceId) {
  deviceId = deviceId.replace(/[-:]/g, '').trim().toLowerCase();
  deviceId = deviceId.substring(0, 12);

  return deviceId;
}

function BLEMidascon(options) {
  Network.call(this, 'ble-midascon', options);
}

util.inherits(BLEMidascon, Network);

BLEMidascon.prototype.discover = function(networkName, options, cb) {
  var self = this;
  var devices = [];
  var discovered;

  if (_.isFunction(options)) {
    cb = options;
    options = undefined;
  }

  discovered = midascon.discover();
  _.forEach(discovered, function (values, macAddress) {
    var deviceId = refineDeviceId(macAddress);
    var sensors = [
      {
        id: [deviceId, 'temperature'].join('-'),
        type: 'temperature',
        model: 'midasconTemp',
        options: {
          name: 'Temperature'
        }
      },
      {
        id: [deviceId, 'humidity'].join('-'),
        type: 'humidity',
        model: 'midasconHumi',
        options: {
          name: 'Humidity'
        }
      }
    ];

    // TODO: Should check whether device model ID must be found dynamically.
    //       Other sensorjs-xxx has the routine which emit 'discovered' and 'done' events.
    devices.push(new Device(self, deviceId, 'midascon', sensors));
  });

  logger.debug('Discovered:', devices);

  return cb && cb(null, devices);
};

module.exports = new BLEMidascon();
