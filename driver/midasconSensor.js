'use strict';

var util = require('util');

var SensorLib = require('../index');
var Sensor = SensorLib.Sensor;
var logger = Sensor.getLogger('Sensor');
var midascon = require('../midascon');

function MidasconSensor(sensorInfo, options) {
  var self = this;

  Sensor.call(self, sensorInfo, options);

  if (sensorInfo.model) {
    self.model = sensorInfo.model;
  }

  self.dataType = MidasconSensor.properties.dataTypes[self.model][0];
}

MidasconSensor.properties = {
  supportedNetworks: ['ble-midascon'],
  dataTypes: {
    midasconTemp: ['temperature'],
    midasconHumi: ['humidity']
  },
  onChange: {
    midasconTemp: false,
    midasconHumi: false
  },
  discoverable: true,
  addressable: false,
  recommendedInterval: 60000,
  maxInstances: 1,
  maxRetries: 8,
  idTemplate: '{deviceAddress}-{type}',
  models: ['midasconTemp', 'midasconHumi'],
  category: 'sensor'
};

util.inherits(MidasconSensor, Sensor);

MidasconSensor.prototype._get = function (cb) {
  var self = this;
  var result = {
    status: 'on',
    id: self.id,
    result: {},
    time: {}
  };
  var value = midascon.getValue(self.deviceId, self.dataType);
  var time = midascon.getTime(self.device.address);

  logger.debug(self.dataType + ':', value, '(' + new Date(time).toLocaleString() + ')');

  result.result[self.dataType] = value;
  result.time[self.dataType] = time;

  if (cb) {
    return cb(null, result);
  } else {
    self.emit('data', result);
  }
};

/*
MidasconSensor.prototype._enableChange = function () {
};

MidasconSensor.prototype._clear = function () {
  apc100.deregisterSensor(this.id);
  apc100.stopPolling();
};
*/

module.exports = MidasconSensor;
