const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');

const SHT31 = require('raspi-node-sht31');
const sht31 = new SHT31();

const Colors = require('colors');

//Conectar puerto serie nativo
const port1 = new SerialPort('/dev/ttyAMA0',{
    baudRate: 9600
  }, function(err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});

//Conectar puerto serie usb1
const port2 = new SerialPort('/dev/ttyUSB0',{
    baudRate: 9600
  }, function(err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});

//Conectar puerto serie usb2
const port3 = new SerialPort('/dev/ttyUSB1',{
    baudRate: 9600
  }, function(err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});

//parser que recibe 7 bytes
const parser1 = port1.pipe(new ByteLength({ length: 7 }));
const parser2 = port2.pipe(new ByteLength({ length: 7 }));
const parser3 = port3.pipe(new ByteLength({ length: 7 }));

//bytes para el request del CO2 al sensor
const req = Buffer.alloc(7, 'FE440008029F25', 'hex');

parser1.on('data', function(data) {

    //timeStamp = new Date();

    // ---- CO2 ----
    // console.log('empezao');
    console.log('========= NUEVA LECTURA ========'.green);
    console.log('Data:', data);

    var CO2 = (data[3] * 256 + data[4]) * 10;
    //console.log(`timestamp: ${ timeStamp.toLocaleString() }`);
    console.log(`CO2_1: ${CO2} ppm`);
    // console.log('acabao');
});

parser2.on('data', function(data) {

    //timeStamp = new Date();

    // ---- CO2 ----
    // console.log('empezao');
    console.log('========= NUEVA LECTURA ========'.green);
    console.log('Data:', data);

    var CO2 = (data[3] * 256 + data[4]) * 10;
    //console.log(`timestamp: ${ timeStamp.toLocaleString() }`);
    console.log(`CO2_2: ${CO2} ppm`);
    // console.log('acabao');
});

parser3.on('data', function(data) {

    //timeStamp = new Date();

    // ---- CO2 ----
    // console.log('empezao');
    console.log('========= NUEVA LECTURA ========'.green);
    console.log('Data:', data);

    var CO2 = (data[3] * 256 + data[4]) * 10;
    //console.log(`timestamp: ${ timeStamp.toLocaleString() }`);
    console.log(`CO2_3: ${CO2} ppm`);
    // console.log('acabao');
});

port1.write(req);
port2.write(req);
port3.write(req);


 
// Read temperature and display in console in F with Relative humidity
sht31.readSensorData().then((data) => {
  
  const temp = data.temperature.toFixed(2);
  const humidity = data.humidity.toFixed(2);
 
  console.log(`The temperature is: ${temp} degress C\nThe Humidity is: ${humidity}%`); // Template strings are great.
 
}).catch(console.log);