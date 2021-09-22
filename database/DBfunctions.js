const mongoose = require('mongoose');
const {lectura1, lectura2, lectura3} = require('../models/lectura');
const Colors = require('colors');

const guardarDB = (data1, data2, data3) => {
    
    let lec1 = new lectura1({
        timestamp: data1.timestamp,
        CO2: data1.CO2,
        temp: data1.temp,
        hum: data1.hum
    });
    let lec2 = new lectura2({
        timestamp: data2.timestamp,
        CO2: data2.CO2,
        temp: data2.temp,
        hum: data2.hum
    });
    let lec3 = new lectura3({
        timestamp: data3.timestamp,
        CO2: data3.CO2,
        temp: data3.temp,
        hum: data3.hum
    });

    lec1.save((err, lecturaDB) => {

        if (err) {
            return console.log('error al guardar en DB1'.red);
        }

        return console.log('ok al guardar en DB1!!!'.green);

    });

    lec2.save((err, lecturaDB) => {

        if (err) {
            return console.log('error al guardar en DB2'.red);
        }

        return console.log('ok al guardar en DB2!!!'.green);

    });

    lec3.save((err, lecturaDB) => {

        if (err) {
            return console.log('error al guardar en DB3'.red);
        }

        return console.log('ok al guardar en DB3!!!'.green);

    });
}

module.exports = {
    guardarDB
}