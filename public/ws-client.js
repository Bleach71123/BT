var socket = io('http://localhost');

var canvas = document.getElementById("a");
var ctx = canvas.getContext("2d");
document.getElementById('play').style.marginLeft = $(window).width() / 2 - 65 + "px";
document.getElementById('play').style.marginTop = $(window).height() / 2 - 125 + "px";
document.getElementById('a').setAttribute('width', $(window).width());
document.getElementById('a').setAttribute('height', $(window).height());

window.addEventListener("resize", function resize(){
    document.getElementById('play').style.marginLeft = $(window).width() / 2 - 65 + "px";
    document.getElementById('play').style.marginTop = $(window).height() / 2 - 125 + "px";
    document.getElementById('a').setAttribute('width', $(window).width());
    document.getElementById('a').setAttribute('height', $(window).height());
});

document.getElementById('play').addEventListener('click', function(){
    socket.emit('play');
});
 
var inGame = false;
var id;
var ballX = 0;
var ballY = 0; 
var moveLeft = moveRight = moveDown = moveUp = false;

    socket.on('init', function (data) {
        inGame = true;
        id = data.id;
        console.log('Created ball: ' + id); 
        document.querySelector("h1").innerHTML = "";
        document.querySelector("p").innerHTML = "";
        document.getElementById('play').style.backgroundColor = "transparent";
        socket.emit('init', {id: id});     
    });

    socket.on('move', function (data) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var gridX = ballX;
        var gridY = ballY;

        while (gridX > 414) //414 is background image width * 2
            gridX -= 414;
        while (gridY > 400) //400 is background image height * 2
            gridY -= 400;

        gridX *= -0.5;
        gridY *= -0.5;

        document.getElementById('a').style.backgroundPosition = gridX + "px " + gridY + "px"; //Moves background

        gridX *= 0.01;
        gridY *= 0.01;

        //Add drwing logic below here ------------------------------------------------------- Add drwing logic below here
        // ----------------------------------------------------------------------------------  (- (ball(X\Y) + grid(X\Y)) + canvas.(width/height) / 2) is required to draw at correct position
        for (var i = 0; i < data.bullets.length; i++){                                          //Draws bullets
            ctx.beginPath();
            ctx.fillStyle = "#ffff00";
            ctx.arc(data.bullets[i].x - (ballX + gridX) + canvas.width / 2, data.bullets[i].y - (ballY + gridY) + canvas.height / 2, 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }


        for (var i = 0; i < data.food.length; i++) {
                ctx.beginPath();
                ctx.fillStyle ="#fff400";
                ctx.arc(data.food[i].x - (ballX + gridX) + canvas.width / 2, data.food[i].y - (ballY + gridY) + canvas.height / 2, 5, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill(); 
        }

        for (var i = 0; i < data.balls.length; i++) {
            if (data.balls[i].id == id){                                                      //Draws Player

                ctx.beginPath();
                ctx.fillStyle = "#EEEEFF";
                ctx.arc(canvas.width / 2, canvas.height / 2, 25, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = "#0000BB";
                //ctx.arc(data.balls[i].x, data.balls[i].y, 20, 0, Math.PI * 2);
                ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                ballX = data.balls[i].x;
                ballY = data.balls[i].y;
            }
            else {                                                                              //Draws enemies (Other players)

                ctx.beginPath();
                ctx.fillStyle = "#bb9900";
                ctx.arc(data.balls[i].x - (ballX + gridX) + canvas.width / 2, data.balls[i].y - (ballY + gridY) + canvas.height / 2, 25, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = "#BB0000";
                ctx.arc(data.balls[i].x - (ballX + gridX) + canvas.width / 2, data.balls[i].y - (ballY + gridY) + canvas.height / 2, 20, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        if (inGame){
            if (ballX - $(window).width()/2 <= 0 ){                                                 //Draws X left border
                ctx.beginPath();
                ctx.fillStyle = "#551122";
                ctx.rect(-45 - (ballX + gridX) + canvas.width / 2, 0, 20, $(window).height());
                ctx.closePath();
                ctx.fill();
            }
            else if (ballX + $(window).width()/2 >= 10000 ){                                        //Draws X right border
                ctx.beginPath();
                ctx.fillStyle = "#551122";
                ctx.rect(10025 - (ballX + gridX) + canvas.width / 2, 0, 20, $(window).height());
                ctx.closePath();
                ctx.fill();
            }
    
            if (ballY - $(window).height()/2 <= 0 ){                                                //Draws Y upper border
                ctx.beginPath();
                ctx.fillStyle = "#551122";
                ctx.rect(0, -45 - (ballY + gridY) + canvas.height / 2, $(window).width(), 20);
                ctx.closePath();
                ctx.fill();
            }
            else if (ballY + $(window).height()/2 >= 10000 ){                                       //Draws Y lower border
                ctx.beginPath();
                ctx.fillStyle = "#551122";
                ctx.rect(0, 10025 - (ballY + gridY) + canvas.height / 2, $(window).width(), 20);
                ctx.closePath();
                ctx.fill();
            }
        }

    });


    socket.on('setBallPos', function(data) {
        ballX = data.x;
        ballY = data.y;
    });


$(window).click(function(event){
    if (inGame){
        var angle = Math.atan2(event.pageX - $(window).width() / 2, - (event.pageY - $(window).height() / 2)) * (180 / Math.PI);
        angle -= 90;
        angle *= (Math.PI / 180);
        var xSpeed = Math.cos(angle)*100/60;
        var ySpeed = Math.sin(angle)*100/60;
        socket.emit('shoot', {id: id, x: ballX, y: ballY, xSpeed: xSpeed, ySpeed: ySpeed});
    }
});

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 65 && !moveLeft) {
        socket.emit('moveLeft', {id: id});
        moveLeft = true;
        console.log("Left");
    }
    if(event.keyCode == 68 && !moveRight) {
        socket.emit('moveRight', {id: id});
        moveRight = true;
    }
    if(event.keyCode == 87 && !moveUp) {
        socket.emit('moveUp', {id: id});
        moveUp = true;
    }
    if(event.keyCode == 83 && !moveDown) {
        socket.emit('moveDown', {id: id});
        moveDown = true;
    }
});

document.addEventListener('keyup', function(event) {
    if(event.keyCode == 65) {
        socket.emit('stopLeft', {id: id});
        moveLeft = false;
    }
    if(event.keyCode == 68) {
        socket.emit('stopRight', {id: id});
        moveRight = false;
    }
    if(event.keyCode == 87) {
        socket.emit('stopUp', {id: id});
        moveUp = false;
    }
    if(event.keyCode == 83) {
        socket.emit('stopDown', {id: id});
        moveDown = false;
    }
});
