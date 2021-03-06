#!/usr/bin/env nodejs

/*var app = require('http').createServer(handler).listen(process.env.PORT || 80);
var io = require('socket.io')(app);
var fs = require('fs');
 
function handler (req, res) {
  fs.readFile(__dirname + 'public/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}*/


const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 80;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use(express.static("public"))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

//Above is creation of the server ---------------- Above is creation of the server
 

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
  this.score = 10;
  this.health = 100;
  this.maxHealth = 100;
}

function bullet (x, y, xspeed, yspeed, id){
  this.x = x;
  this.y = y;
  this.xspeed = xspeed;
  this.yspeed = yspeed;
  this.id = id;
}

function food (x, y){
  this.x = x;
  this.y = y;
}

var balls = [];
var bullets = [];
var foods = [];
var id = 0;
var connections = [];
var borderX = borderY = 10000;
var counter = 0;


io.on('connection', function (socket) {

  connections.push(socket);
  console.log("\nNew Connection");
  
  socket.on('play', function(){
    socket.emit('init', {id: connections.length});
  });
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

  socket.on('shoot', function(data){
    //console.log("bullet { x: " + data.x + ", y: " + data.y + ", id: " + data.id + "}\n");
    bullets.push(new bullet(data.x, data.y, data.xSpeed, data.ySpeed, data.id));
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
    if (balls[i].health < balls[i].maxHealth)
      balls[i].health += 0.01;
    if (balls[i].moveLeft && balls[i].x - 1 > 0)
      balls[i].x -= 0.8;
    if (balls[i].moveRight && balls[i].x + 1 < borderX)
      balls[i].x += 0.8;
    if (balls[i].moveDown && balls[i].y + 1 < borderY)
      balls[i].y += 0.8;
    if (balls[i].moveUp && balls[i].y - 1 > 0)
      balls[i].y -= 0.8;
  }

  for (var i = 0; i < bullets.length; i++){
    bullets[i].x += bullets[i].xspeed;
    bullets[i].y += bullets[i].yspeed;

    if (bullets[i].x < -25 || bullets[i].x > borderX + 25) {
      bullets.splice(i, 1);
      i--;
    }
    else if (bullets[i].y < -25 || bullets[i].y > borderY + 25) {
      bullets.splice(i, 1);
      i--;
    }

    for (var c = 0; c < balls.length; c++) {
      if (bullets[i] != null){
        if (bullets[i].id != balls[c].id){
          if (Math.abs(bullets[i].x - balls[c].x) <= 25){
            if (Math.abs(bullets[i].y - balls[c].y) <= 25){
              if (Math.sqrt(Math.pow(bullets[i].x - balls[c].x, 2) + Math.pow(bullets[i].y - balls[c].y, 2)) < 25){   //Bullet collision logic
                bullets.splice(i, 1);
                i--;
                balls[c].health -= 10;
              }
            }
          }
        }
      }
    }

  }

  for (var i = 0; i < foods.length; i++) {
    for (var c = 0; c < balls.length; c++) {
      if (Math.abs(foods[i].x - balls[c].x) <= 25){
        if (Math.abs(foods[i].y - balls[c].y) <= 25){
          if (Math.sqrt(Math.pow(foods[i].x - balls[c].x, 2) + Math.pow(foods[i].y - balls[c].y, 2)) < 25){  //Food eating logic
            foods.splice(i, 1);
            i--;
            balls[c].score += 5;
          }
        }
      }
    }
  }

  if (counter == 100 && food.length < 45){
    var x = Math.floor(Math.random() * borderX);  //Sets food position to random
    var y = Math.floor(Math.random() * borderY);
    var d = new food(x, y);
    foods.push(d); 
    counter = 0;
  }
  counter++;

  io.sockets.emit('move', {balls: balls, bullets: bullets, food: foods, borderX: borderX, borderY: borderY});
}


var updateInterval = setInterval(move, 2);
