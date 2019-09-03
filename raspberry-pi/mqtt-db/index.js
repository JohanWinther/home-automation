const exec = require('child_process').exec;
const mqtt = require('mqtt');
const publishConfig = require("./publishers");
let db_path = publishConfig.db_path;
let publishers = publishConfig.publishers;

let sqlite = (statement) => {
    exec(`sqlite3 ${db_path} "${statement}"`, (err, stdout, stderr) => console.log(stdout));
};

// Create database file and create table for each sensor
publishers.forEach(p => {
    sqlite(`CREATE TABLE IF NOT EXISTS ${p.db_table} (time INTEGER, temperature float)`);
});

const mqttClient  = mqtt.connect('mqtt://localhost');

mqttClient.on('connect', () => {
    publishers.forEach(p => {
        mqttClient.subscribe(p.topic, function (err) {
            if (err) {
                console.error(`Could not subscribe to: ${p.topic}`)
            } else {
                console.log(`Subscribed to: ${p.topic}`)
            }
          })
    });
})

mqttClient.on('message', (topic, message) => {
    let epochTime = Date.now();
    let epochTimeSeconds = Math.floor(epochTime / 1000);
    let table = publishers.filter((item) => item.topic === topic)[0].db_table;
    sqlite(`INSERT INTO ${table} (time, temperature) VALUES (${epochTime},${message})`);
    console.log(new Date(epochTime).toISOString(), topic, table, message.toString());
});