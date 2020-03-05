let ballPlayer;
const ballPlayers = new Map();
let ballToEat = new Map();
let zoom = 1;
let id;
let client = new WebSocketClient('ws', '127.0.0.1', 8080, '/Agar1_war_exploded/endpoint');
client.connect();

function rand(){
    let x = Math.floor(Math.random()*2*MAX_WIDTH) + MIN_WIDTH;
    let y = Math.floor(Math.random()*2*MAX_HEIGHT) + MIN_HEIGHT;
    ballPlayer = new Ball(x,y, RAD_INIT_BALL);
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
    for (let [key,value] of ballPlayers) {
        if(id != key) {
            fill(0,0,255);
            value.show();
            if(ballPlayer.eats(ballPlayers.get(key))){
                client.webSocket.send("pEaten:"+key);
            }
        }
    }
}

function displayBalls () {
    for(let [key,value] of ballToEat){
        value.show();
        if (ballPlayer.eats(ballToEat.get(key))) {
            client.webSocket.send("bEaten:"+key);
            ballToEat.delete(key);
        }

    }
}
function setup() {
    createCanvas(window.innerWidth - 20,  window.innerHeight - 20);
    frameRate(FPS);
    rand();
}

function draw() {
    myText();
    transl();
    displayBall();
    displayPlayers();
    displayBalls();
}

function windowResized() {
    resizeCanvas(window.innerWidth - 20, window.innerHeight - 20);
}