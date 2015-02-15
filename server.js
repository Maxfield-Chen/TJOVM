var express = require("express")
var http = require("http")
var Primus = require("primus")

SERVERPORT = 8080

//Setup primus options and create a basic http server
var options = {
  transformer : "engine.io"
}

var app = express()
app.use(express.static('./'))
var server = http.createServer(app)
var primus = new Primus(server, options)
server.listen(SERVERPORT)
console.log("Server started, listening on port: " + SERVERPORT)

app.get('/', function(request, response) {
  response.sendfile('./html/index.html')
})


//Now event listeners:
primus.on("connection", function(spark) {
  console.log("New client");
  var newID = Date.now();
  //If the server gets data of any sort, just pass it on to the clients
  //..which it's not...
  spark.on("data", function(data) {
    console.log(data)
    primus.write(data)
  })
  spark.write({
    init: true,
    id: newID
  })
  primus.write({
    newPlayer: true,
    id: newID
  })
})

