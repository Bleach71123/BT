var socket = io('http://localhost');

var canvas = document.getElementById("a");
var ctx = canvas.getContext("2d");
document.getElementById('a').setAttribute('width', $(window).width());
document.getElementById('a').setAttribute('height', $(window).height());

window.addEventListener("resize", function resize(){
    document.getElementById('a').setAttribute('width', $(window).width());
    document.getElementById('a').setAttribute('height', $(window).height());
});

 
var id;

var ballX = 0;
var ballY = 0; 

    socket.on('init', function (data) {
        id = data.id;
        console.log('Created ball: ' + id); 
        document.querySelector("h1").innerHTML = "";
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

        /*ctx.beginPath();                                                                       //My attempt to draw a boundary  --WAY too laggy
        ctx.fillStyle = "#551122";
        ctx.rect(-10 - (ballX + gridX) + canvas.width / 2, -10 - (ballY + gridY) + canvas.height / 2, 20, 10);
        ctx.rect(-10 - (ballX + gridX) + canvas.width / 2, -10 - (ballY + gridY) + canvas.height / 2, 10, data.borderY + 20);
        ctx.rect(data.borderX - (ballX + gridX) + canvas.width / 2, -10 - (ballY + gridY) + canvas.height / 2, 10, data.borderY + 20);
        ctx.rect(-10 - (ballX + gridX) + canvas.width / 2, data.borderY - (ballY + gridY) + canvas.height / 2, data.borderX + 20, 10);
        ctx.closePath();
        ctx.fill();*/

    });

    socket.on('setBallPos', function(data) {
        ballX = data.x;
        ballY = data.y;
    });

//var moveLeft = moveRight = moveUp = moveDown = false;

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 65) {
        socket.emit('moveLeft', {id: id});
        //moveLeft = true;
    }
    if(event.keyCode == 68) {
        socket.emit('moveRight', {id: id});
        //moveRight = true;
    }
    if(event.keyCode == 87) {
        socket.emit('moveUp', {id: id});
        //moveUp = true;
    }
    if(event.keyCode == 83) {
        socket.emit('moveDown', {id: id});
        //moveDown = true;
    }
});

document.addEventListener('keyup', function(event) {
    if(event.keyCode == 65) {
        socket.emit('stopLeft', {id: id});
        //moveLeft = false;
    }
    if(event.keyCode == 68) {
        socket.emit('stopRight', {id: id});
        //moveRight = false;
    }
    if(event.keyCode == 87) {
        socket.emit('stopUp', {id: id});
        //moveUp = false;
    }
    if(event.keyCode == 83) {
        socket.emit('stopDown', {id: id});
        //moveDown = false;
    }
});

/*function move (){
    if (moveLeft && ballX - 1 > 0)
      ballX--;
    if (moveRight && ballX + 1 < 1000)
      ballX++;
    if (moveDown && ballY + 1 < 1000)
      ballY++;
    if (moveUp && ballY - 1 > 0)
      ballY--;
    socket.emit('moved', {x: ballX, y: ballY, id: id});
}*/