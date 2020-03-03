var ballPlayer;
const ballPlayers = new Map();
var ballToEat = new Map();
var zoom = 1;
var id;
let client = new WebSocketClient('ws', '127.0.0.1', 8080, '/Agar1_war_exploded/endpoint');
client.connect();
function setup() {
    createCanvas(700, 700);
    x = Math.floor(Math.random()*2*MAX_WIDTH) + MIN_WIDTH;
    y = Math.floor(Math.random()*2*MAX_HEIGHT) + MIN_HEIGHT;
    ballPlayer = new Ball(x,y, RAD_INIT_BALL);
    frameRate(FPS);
}
function draw() {

    background(0);
    textSize(32);
    text("X:"+ballPlayer.pos.x.toFixed(2)+"; Y:"+ballPlayer.pos.y.toFixed(2)+"; R:"+ballPlayer.r.toFixed(2), 10, 30);
    fill(0, 102, 153);
    translate(width / 2, height / 2);
    var newzoom = 64 / ballPlayer.r;
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    translate(-ballPlayer.pos.x, -ballPlayer.pos.y);
    client.webSocket.send("pos:"+String(ballPlayer.pos.x)+";"+String(ballPlayer.pos.y)+";"+String(ballPlayer.r));
    for (var [key,value] of ballPlayers) {
        if(id != key) {
            fill(0,0,255);
            value.show();
        }
    }
    for(var [key,value] of ballToEat){
        value.show();
        if (ballPlayer.eats(ballToEat.get(key))) {
            client.webSocket.send("bEaten:"+key);
            ballToEat.delete(key);
        }

    }
    ballPlayer.constrain();
    ballPlayer.show();
    if (mouseIsPressed) {
        ballPlayer.update();
    }
}