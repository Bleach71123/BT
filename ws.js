const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 80;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  //.use((req, res) => res.sendFile(INDEX) )
  .use(express.static("public"))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);


function ball (x, y, xspeed, yspeed, id){
  this.moveLeft = false;
  this.moveRight = false;
  this.moveDown = false;
  this.moveUp = false;
  this.paused = false;
  this.x = x;
  this.y = y;
  this.xspeed = xspeed;
  this.yspeed = yspeed;
  this.id = id;
}

function bullet (x, y, xspeed, yspeed, id){
  this.x = x;
  this.y = y;
  this.xspeed = xspeed;
  this.yspeed = yspeed;
  this.id = id;
}

var balls = [];
var bullets = [];
var id = 0;
var connections = [];
var borderX = borderY = 10000;

console.log("Active");

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  connections.push(socket);
  console.log("\nNew Connection");

  socket.emit('init', {id: connections.length});
  socket.on('init', function(data) {

    var x = Math.floor(Math.random() * borderX);  //Sets ball position to random
    var y = Math.floor(Math.random() * borderY);
    var b = new ball(x, y, 1, 1, data.id);
    balls.push(b);                          //Adds new ball to array of balls

    console.log("Ball Created. " + data.id);
    socket.emit('setBallPos', {x: x, y: y});
    
    var output = "";                        //Prints out x, y and id values of ball when it is created
    output += "ball { x: " + balls[balls.length-1].x;
    output += ", y: " + balls[balls.length-1].y;
    output += ", id: " + balls[balls.length-1].id + " }\n";
    console.log(output);
    
  });


  socket.on('moveLeft', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveLeft = true;
  });
  socket.on('moveRight', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveRight = true;
  });
  socket.on('moveDown', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveDown = true;
  });
  socket.on('moveUp', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveUp = true;
  });

  socket.on('stopLeft', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveLeft = false;
  });
  socket.on('stopRight', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveRight = false;
  });
  socket.on('stopDown', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveDown = false;
  });
  socket.on('stopUp', function(data){
    if (balls[data.id - 1] != null)
      balls[data.id - 1].moveUp = false;
  });

  /*socket.on('moved', function(data){
    var index = (balls.findIndex(function(ballId){
      return ballId == data.id;
    }));
    balls[index] = new ball(data.x, data.y, 1, 1, data.id);
  });*/


  socket.on('disconnect', function(){

    function isDisconnected(disconnected){
      return disconnected == socket;
    }
    var index = (connections.findIndex(isDisconnected) + 1);
    console.log(index + " :Disconnected");
    balls.splice(index - 1, 1);
    connections.splice(index - 1, 1);
    console.log("Ball Deleted. " + index);
    for (var i = index - 1; i < balls.length; i++) {
      balls[i].id--;
    }
    id--;
  });

});


function move(){
  for (var i = 0; i < balls.length; i++) {
    if (balls[i].moveLeft && balls[i].x - 1 > 0)
      balls[i].x--;
    if (balls[i].moveRight && balls[i].x + 1 < borderX)
      balls[i].x++;
    if (balls[i].moveDown && balls[i].y + 1 < borderY)
      balls[i].y++;
    if (balls[i].moveUp && balls[i].y - 1 > 0)
      balls[i].y--;
  }

  for (var i = 0; i < bullets.length; i++){

  }

  io.sockets.emit('move', {balls: balls, borderX: borderX, borderY: borderY});
}

var updateInterval = setInterval(move, 0);
