const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');
const sensor = require("node-dht-sensor");
const Colors = require('colors');
const cron = require('node-cron');
require('dotenv').config();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const SHT31 = require('raspi-node-sht31');
const sht31 = new SHT31();

const { dbConnect } = require('./database/config.js');
const { guardarDB } = require('./database/DBfunctions');

console.log('empezando');
const fecha = new Date().toLocaleDateString().replaceAll("/", "-");

// el código está "a lo bruto", repitiendo mucho código (todo 3 veces, para cada sensor) ya que es para una prueba unica y no me quiero complicar"

const csvWriter1 = createCsvWriter({
    path: `./docs/sensor1_${fecha}.csv`,
    header: [
        {id: 'timestamp', title: 'TIMESTAMP'},
        {id: 'CO2', title: 'CO2'},
        {id: 'temp', title: 'TEMP'},
        {id: 'hum', title: 'HUM'}
    ]
});

const csvWriter2 = createCsvWriter({
    path: `./docs/sensor2_${fecha}.csv`,
    header: [
        {id: 'timestamp', title: 'TIMESTAMP'},
        {id: 'CO2', title: 'CO2'},
        {id: 'temp', title: 'TEMP'},
        {id: 'hum', title: 'HUM'}
    ]
});

const csvWriter3 = createCsvWriter({
    path: `./docs/sensor3_${fecha}.csv`,
    header: [
        {id: 'timestamp', title: 'TIMESTAMP'},
        {id: 'CO2', title: 'CO2'},
        {id: 'temp', title: 'TEMP'},
        {id: 'hum', title: 'HUM'}
    ]
});

///Conectar puerto serie nativo
const port1 = new SerialPort('/dev/ttyAMA0',{
    baudRate: 9600
  }, function(err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});

//Conectar puerto serie usb0
const port2 = new SerialPort('/dev/ttyUSB0',{
    baudRate: 9600
  }, function(err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});

//Conectar puerto serie usb1
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

let CO2_1, CO2_2, CO2_3;
let timeStamp = new Date();
let temp;
let hum;

//funcion que se llama a si misma cada 2 seg y manda el request
const sendReq = () => {

    // ---- TEMP/HUM ----
    sht31.readSensorData().then((data) => {
  
        temp = data.temperature.toFixed(2);
        hum = data.humidity.toFixed(2);
       
    }).catch(console.log);

    port1.write(req);
    port2.write(req);
    port3.write(req);
    // console.log("Enviado comando");
    setTimeout(sendReq, 2000);
    return;
}

//listener que recibe datos del puerto serie
parser1.on('data', function(data) {

    lectura(data, 1)

});
parser2.on('data', function(data) {

    lectura(data, 2)

});
parser3.on('data', function(data) {

    lectura(data, 3)

});

const lectura = (data, sensor) => {

    timeStamp = new Date();

    // ---- CO2 ----
    // console.log('empezao');
    console.log(`========= NUEVA LECTURA sensor ${sensor} ========`.green);
    console.log('Data:', data);

    console.log(`timestamp: ${ timeStamp.toLocaleString() }`);

    if(sensor == 1){
        CO2_1 = (data[3] * 256 + data[4]) * 10;
        console.log(`CO2: ${CO2_1} ppm`);
    }
    else if(sensor == 2){
        CO2_2 = (data[3] * 256 + data[4]) * 10;
        console.log(`CO2: ${CO2_2} ppm`);
    }
    else {
        CO2_3 = (data[3] * 256 + data[4]) * 10;
        console.log(`CO2: ${CO2_3} ppm`);
    }
    // console.log('acabao');

    // ---- TEMP/HUM ----
    console.log(`temp: ${temp}°C, humidity: ${hum}%`);
}

// Conexion BD Mongo Atlas
const conectarDB = async() => {
   await dbConnect();
}
 conectarDB();
// guardar en base de datos lecturas cada 5 minutos
cron.schedule('1 * * * * *', () => {
    console.log('guardando en base de datos...'.yellow);
    let datos1 = {
        timestamp: timeStamp.toLocaleString(),
        CO2: `${CO2_1} ppm`,
        temp: `${temp} C`,
        hum: `${hum} %`
    };
    let datos2 = {
        timestamp: timeStamp.toLocaleString(),
        CO2: `${CO2_2} ppm`,
        temp: `${temp} C`,
        hum: `${hum} %`
    };
    let datos3 = {
        timestamp: timeStamp.toLocaleString(),
        CO2: `${CO2_3} ppm`,
        temp: `${temp} C`,
        hum: `${hum} %`
    };
    // console.log(datos1);
    // console.log(datos2);
    // console.log(datos3);
    //guardar en BD
    guardarDB(datos1, datos2, datos3);
    // guardar en csv en local
    csvWriter1.writeRecords([datos1])       // returns a promise
    .then(() => {
        console.log('Guardado en csv local1'.blue);
    });
    csvWriter2.writeRecords([datos2])       // returns a promise
    .then(() => {
        console.log('Guardado en csv local2'.blue);
    });
    csvWriter3.writeRecords([datos3])       // returns a promise
    .then(() => {
        console.log('Guardado en csv local3'.blue);
    });
});

/// ejecutamos por primera vez la función de enviar el req
sendReq();

