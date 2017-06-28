'use strict';

var noble = require('noble');
var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./index').Sensor.getLogger('Sensor');

//////
// {
//   <BLE MAC address(device ID)>: {
//     temperature: <value>,
//     humidity: <value>,
//     time: <time>
//   }
// }
var deviceMap = {};

function refineMacAddress(macAddress) {
  if (_.isString(macAddress)) {
    macAddress = macAddress.replace(/[-:]/g, '').trim().toLowerCase().substring(0, 12);
  } else {
    logger.warn('BLE MAC address is not a string:', macAddress);
  }

  return macAddress;
}

function onDiscover(peripheral) {
  var name = peripheral.advertisement.localName;
  var data = peripheral.advertisement.manufacturerData;
  var address = refineMacAddress(peripheral.address);
  var temperature;
  var humidity;
  var time = new Date().getTime();

  if (name && name.indexOf('MIDASCON') === 0) {

    temperature = data.readInt16LE(0) / 100;
    humidity = data.readUInt16LE(2) / 100;

    logger.debug('Local Name:', name.trim());
    logger.debug('MAC Address:', address);
    logger.debug('Temperature:', temperature);
    logger.debug('Humidity:', humidity);

    deviceMap[address] = {
      temperature: temperature,
      humidity: humidity,
      time: time
    };
  }
}

function Midascon() {
  EventEmitter.call(this);

  noble.on('stateChange', function (state) {
    if (state === 'poweredOn') {
      logger.debug('BLE is powered on.');
      noble.startScanning(null, true);
    } else {
      noble.stop.Scanning();
    }
  });

  noble.on('discover', onDiscover);
}

util.inherits(Midascon, EventEmitter);

Midascon.prototype.discover = function () {
  logger.debug('deviceMap:', deviceMap);
  return deviceMap;
};

Midascon.prototype.getValue = function (deviceId, type) {
  var sensorItem = deviceMap[deviceId];

  return sensorItem && sensorItem[type] || null;
};

Midascon.prototype.getTime = function (deviceId) {
  var sensorItem = deviceMap[deviceId];

  return sensorItem && sensorItem.time || null;
};

module.exports = new Midascon();
