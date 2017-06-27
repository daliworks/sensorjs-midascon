'use strict';

var logger = require('log4js').getLogger('Sensor');

function initDrivers() {
  var midasconSensor;

  try {
    midasconSensor = require('./driver/midasconSensor');
  } catch(e) {
    logger.error('Cannot load ./driver/midasconSensor', e);
  }

  return {
    midasconSensor: midasconSensor
  };
}

function initNetworks() {
  var bleMidascon;

  try {
    bleMidascon = require('./network/ble-midascon');
  } catch (e) {
    logger.error('Cannot load ./network/ble-midascon', e);
  }

  return {
    'ble-midascon': bleMidascon
  };
}

module.exports = {
  networks: ['ble-midascon'],
  drivers: {
    midasconSensor: ['midasconTemp', 'midasconHumi']
  },
  initNetworks: initNetworks,
  initDrivers: initDrivers
};
