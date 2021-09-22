const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');
const sensor = require("node-dht-sensor");
const Colors = require('colors');
const cron = require('node-cron');
require('dotenv').config();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const SHT31 = require('raspi-node-sht31');
const sht31 = new SHT31();

