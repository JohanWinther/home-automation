const express = require("express")
const cors = require('cors')
var app = express()
app.use(cors())

// Server port
var HTTP_PORT = 8082
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
})

app.use(express.static('src'))

app.use(function(req, res){
    res.status(404);
})