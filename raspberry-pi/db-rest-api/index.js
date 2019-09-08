const publishConfig = require("/home/pi/mqtt-db/publishers");
let db_path = publishConfig.db_path;

const express = require("express")
const cors = require('cors')
var app = express()
app.use(cors())

var spawn = require('child_process').spawn;

let sqlite = (statement, table_id) => 
    new Promise((resolve, reject) => {
        let command = spawn(`sqlite3`, [db_path, statement])

        var queryResult = ''
        command.stdout.on('data', data => {
            queryResult += data.toString()
        })

        command.on('close', () => {
            let result = queryResult.toString().split('\n').map(item => {
                [ts, val] = item.split('|')
                ts *= 1000
                return {"timestamp": ts, "value": val, "id": table_id}
            })
            result = result.filter(item => item.timestamp && item.value && item.id)
            resolve(result)
        })
                
        command.on('error', function(data) {
            reject(data)
        })

        setTimeout(function() {
            reject('Promise timed out.');
        }, 5000);

    });

// Server port
var HTTP_PORT = 8081
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// Root endpoint
app.use("/history/:table_id", (req, res, next) => {

    let start = Math.floor(parseInt(req.query.start)/1000)
    let end = Math.floor(parseInt(req.query.end)/1000)
    if (start > end) [start, end] = [end, start]

    let statement = `SELECT * FROM ${req.params.table_id}`

    statement += (start | end) ? ` WHERE ` :''
    let startStatement = !isNaN(start) ? `time > ${start}`:''
    let endStatement = !isNaN(end) ? `time < ${end}`:''
    statement += (start && end) ? `${startStatement} AND ${endStatement}` : `${startStatement}${endStatement}`

    let numberOfRows = (end-start)/5
    const maximumRows = 10000 // ~ 0.3 seconds
    let nth = Math.ceil(numberOfRows/maximumRows)
    statement += ` AND ROWID % ${nth} = 0`
    statement += ';'
    
    sqlite(statement, req.params.table_id).then(result => {
        res.setHeader('Content-Type', 'application/json')
        res.json(result)
    }).catch(err => {
        res.setHeader('Content-Type', 'application/json')
        res.json({"error": err})
    })
    return;
});

app.use(function(req, res){
    res.status(404);
});