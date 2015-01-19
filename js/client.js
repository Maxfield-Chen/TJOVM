var primus = Primus.connect()

function Player(x, y, id) {
  this.x = x;
  this.y = y;
  this.mouseDown = false;
  this.id = id;
}

//If i'm being honest I should probably use a tree
//to get logn searchtime but whatever.
//actually then I'd lose the constant edit time so nope
function playerExists(players, playerId){
  for(i = 0; i < players.length; i++){
    if(playerId == players[i].id) {
      return i;
    }
  }
  return -1;
}

//This array holds all networked players.
var players = new Array();
var clientID;

primus.on("open", function(){
})

primus.on("data", function(data){
  //console.log(data)
  if(data.init) {
    clientID = data.id;
    console.log("Connected to server: " + clientID)
    var newPlayer = new Player(-1, -1, data.id);
    players.push(newPlayer);
  } else if(data.newMove) {
    //console.log("New Move (" + data.x + "," + data.y + "," + data.id + ")");
    var playerIndex = playerExists(players, data.id);
    if(playerIndex != -1) {
      players[playerIndex].x = data.x;
      players[playerIndex].y = data.y;
    } else {
      var newPlayer = new Player(data.x, data.y, data.id);
      players.push(newPlayer);
    }
  } else if(data.startClick) {
    var playerIndex = playerExists(players, data.id);
    if(playerIndex != -1) { 
      players[playerIndex].mouseDown = true;
    }
    else {
      var newPlayer = new Player(data.x, data.y, data.id);
      newPlayer.mouseDown = true;
      players.push(newPlayer);
    }
  } else if(data.endClick) {
    var playerIndex = playerExists(players, data.id);
    if(playerIndex != -1) { players[playerIndex].mouseDown = false; }
    else {
      var newPlayer = new Player(data.x, data.y, data.id);
      newPlayer.mouseDown = false;
      players.push(newPlayer);
    }
  } else if(data.newPlayer) {
    if(!data.id) return;
    var playerIndex = playerExists(players, data.id);
    if(playerIndex != -1) {
      var newPlayer = new Player(data.x, data.y, data.id);
      players.push(newPlayer);
    }
  }
})


