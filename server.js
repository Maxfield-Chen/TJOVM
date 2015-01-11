var express = require("express")
var http = require("http");
var Primus = require("primus");

//Setup primus options and create a basic http server
var options = {
  transformer : "engine.io"
}

var app = express()
app.use(express.static('./'))
var server = http.createServer(app)
var primus = new Primus(server, options)
server.listen(8080)

app.get('/', function(request, response) {
  response.sendfile('./html/index.html')
})


//Now event listeners:
primus.on("connection", function(spark) {
  console.log("New client");
  var newID = Date.now();
  spark.on("data", function(data) {
    console.log(data);
    primus.write(data);
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

//If the server gets data of any sort, just pass it on to the clients
