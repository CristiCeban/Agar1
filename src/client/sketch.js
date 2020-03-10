let ballPlayer;
const ballPlayers = new Map();
let ballToEat = new Map();
let zoom = 1;
let id = -1;
let x;
let y;
let client = new WebSocketClient('ws', '127.0.0.1', 8080, '/Agar1_war_exploded/endpoint');
client.connect();

function rand() {
    x = Math.floor(Math.random()*2*MAX_WIDTH) + MIN_WIDTH;
    y = Math.floor(Math.random()*2*MAX_HEIGHT) + MIN_HEIGHT;
}
function myText(){
    background(0);
    textSize(32);
    text("X:"+ballPlayer.pos.x.toFixed(2)+"; Y:"+ballPlayer.pos.y.toFixed(2)+"; R:"+ballPlayer.r.toFixed(2), 10, 30);
    text("VellX:"+ballPlayer.vel.x.toFixed(2)+"; VellY:"+ballPlayer.vel.y.toFixed(2),10,60);
    fill(0, 102, 153);
}

function transl () {
    translate(width / 2, height / 2);
    var newzoom = 64 / ballPlayer.r;
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    translate(-ballPlayer.pos.x, -ballPlayer.pos.y);
}
function displayBall(){
    client.webSocket.send("pos:"+String(ballPlayer.pos.x)+";"+String(ballPlayer.pos.y)+";"+String(ballPlayer.r));
    ballPlayer.constrain();
    ballPlayer.show();
    if (mouseIsPressed) {
        ballPlayer.update();
    }
}

function displayPlayers (){
    for (let [key,ball] of ballPlayers) {
        if(parseInt(id) !== parseInt(key)) {
            console.log("!beforeEat!");
            fill(0,0,255);
            ball.show();
            //console.log("otherBallX:"+ball.pos.x+" Y:"+ball.pos.y+" R:"+ball.r);
            if (ballPlayer.eatsPlayer(ball)){
                //console.log("xPlayer:"+ballPlayer.pos.x+";yPlayer"+ballPlayer.pos.y+"rPlayer:"+ballPlayer.r);
                //console.log("xBall:"+ball.pos.x+";yBall"+ball.pos.y+"rBall:"+ball.r);
                client.webSocket.send("pEaten:"+key);
                console.log("pEaten:"+key);
                ballPlayers.delete(key);
            }
            console.log("!AfterEat!");
        }
    }
}

function displayBalls () {
    for(let [key,ball] of ballToEat){
        ball.show();
        if (ballPlayer.eatsPlayer(ball)) {
            client.webSocket.send("bEaten:"+key);
            ballToEat.delete(key);
        }
    }
}
function setup() {
    createCanvas(window.innerWidth - 20,  window.innerHeight - 20);
    frameRate(FPS);
    rand();
    ballPlayer = new Ball(x,y, RAD_INIT_BALL);
    setTimeout(function(){
        client.send("start:"+x.toFixed(2)+";"+y.toFixed(2));
    }, 100);
}

function draw() {
    console.log("beforeText");
    myText();
    console.log("afterText");
    transl();
    console.log("afterTranslation");
    displayBall();
    console.log("afterBall");
    displayPlayers();
    console.log("afterPlayers");
    displayBalls();
    console.log("AfterBalls");
}

function windowResized() {
    resizeCanvas(window.innerWidth - 20, window.innerHeight - 20);
}