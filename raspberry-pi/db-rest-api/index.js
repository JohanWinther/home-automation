const publishConfig = require("/home/pi/mqtt-db/publishers");
let db_path = publishConfig.db_path;

const express = require("express");
const cors = require('cors');
var app = express();
app.use(cors());

// Server port
const HTTP_PORT = 8081;

const exec = require('child_process').exec;

let sqlite = (statement, table_id) =>
    new Promise((resolve, reject) => {
        let command = `sqlite3 ${db_path} "${statement}"`;
        console.log(command);

        exec(command, (error, stdout, stderr) => {
            if (error === null) {
                let result = stdout.split('\n').map(measurement => {
                    [ts, val] = measurement.split('|');
                    ts = parseInt(ts);
                    ts *= 1000; // Unix time format
                    return {
                        "id": table_id,
                        "timestamp": ts,
                        "value": val, // parsing is handled by client
                    }
                });
                result = result.filter(item => item.timestamp && item.value && item.id);
                resolve(result);
            } else {
                error["stderr"] = stderr;
                reject(error);
            }
        });


        setTimeout(() => {
            reject('Promise timed out.');
        }, 5000);

    });


// Root endpoint
app.use("/history/:table_id", (req, res, next) => {
    let start, end;

    if (req.query.start !== undefined) {
        // Remove milliseconds from unix time integer
        start = Math.floor(parseInt(req.query.start) / 1000);
    }
    if (req.query.end !== undefined) {
        end = Math.floor(parseInt(req.query.end) / 1000);
    }
    if (start && end && start > end) {
        [start, end] = [end, start];
    }

    // Moving average
    const movingAverageWindowSize = 10;
    const halfWindowSize = movingAverageWindowSize / 2;

    // Build sql query
    let statement = [
        "SELECT",
        'time,',
        `AVG(temperature) OVER (ROWS BETWEEN ${halfWindowSize} PRECEDING AND ${halfWindowSize} FOLLOWING)`,
        "FROM",
        req.params.table_id]; // SELECT movingAverageTemp, time FROM table_id

    if (start || end) {

        statement.push('WHERE'); // SELECT * FROM table_id WHERE

        let timeQuery = []
        if (start) {
            timeQuery.push(`time > ${start}`);
        }
        if (end) {
            timeQuery.push(`time < ${end}`);
        }

        // If range is selected, show {maximumRows} over range
        if (start && end) {
            const numberOfRows = (end - start) / 5; // Time difference in seconds / 5 seconds
            const maximumRows = 10000 // load time ~ 0.3 seconds
            let everyNthRow = Math.ceil(numberOfRows / maximumRows);
            timeQuery.push(`ROWID % ${everyNthRow} = 0`);
        }
        timeQuery = timeQuery.join(' AND ');

        statement.push(timeQuery);

    }
    statement = statement.join(" ") + ";"; // SELECT * FROM table_id WHERE time > start AND time < end AND ROWID % everyNthRow = 0;

    sqlite(statement, req.params.table_id).then(result => {
        res.json(result);
    }).catch(err => {
        res.json({ "error": err });
    });
});

// Start server
app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});