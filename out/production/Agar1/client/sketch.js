/**I use p5.js for graphics.
 * p5.js is a JavaScript library for creative coding,
 * with a focus on making coding accessible and inclusive for
 * artists, designers, educators, beginners, and anyone else!
 * p5.js is free and open-source.
 * p5.js consists from 2 important functions: setup() and draw().
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 */

/**Player's ball*/
let ballPlayer;

/**A JS Map to store all players and their balls
 *
 * @type {Map<String, Ball>}
 */
const ballPlayers = new Map();

/**A JS Map to store "simple" balls
 *
 * @type {Map<String, Ball>}
 */
let ballToEat = new Map();

/**Initial zoom on the ballPlayer to grow smoothly on screen.
 *
 * @type {number}
 */
let zoom = 1;

/**Initial ID of the ball is set on -1,after the connection,
 * the server assigns an ID to the client.
 *
 * @type {number}
 */
let id = -1;

/**The coordinate X of the center of the player's ball.
 *
 * @type {number}
 */
let x;

/**The coordinate Y of the center of the player's ball.
 *
 * @type {number}
 */
let y;

/**Client is the instance of WebSocketClient class.
 * It allows connection to server and works using WS protocol
 *
 * @type {WebSocketClient}
 */
let client = new WebSocketClient('ws', 'localhost', 8080, '/Agar1_war_exploded/endpoint');

/**Connection to the server.*/
client.connect();

/**Client generates the coordinates of player's ball center.*/
function rand() {
    x = Math.floor(Math.random()*2*MAX_WIDTH) + MIN_WIDTH;
    y = Math.floor(Math.random()*2*MAX_HEIGHT) + MIN_HEIGHT;
}

/**The function which displays the text on the canvas.
 * The coordinates of the center of the player's ball,
 * the radius of the player's ball,
 * the velocity on X axis and Y axis.
 */
function myText(){
    /**Puts the background color WHITE*/
    background(0);

    /**Assigns the text size with 32 pixels.*/
    textSize(32);

    /**Displays the coordinates, radius*/
    text("X:"+ballPlayer.pos.x.toFixed(2)+"; Y:"+ballPlayer.pos.y.toFixed(2)
          +"; R:"+ballPlayer.r.toFixed(2), 10, 30);

    /**Displays the velocity on X axis and Y axis.*/
    text("VellX:"+ballPlayer.vel.x.toFixed(2)+";" +
          "VellY:"+ballPlayer.vel.y.toFixed(2),10,60);

}

/**Makes the view of the world relative to the player.
 * Allows animations to be smooth.
 */
function transl () {
    /**Sets view of the world relative to the player's ball*/
    translate(width / 2, height / 2);

    /**Newzoom is a changed zoom if player eats another ball,
     * either the ball is "simple" or an another player.
     * Because the initial radius of the player's ball is 64 pixels,
     * all changes are based on this number.
     *
     * @type {number}
     */
    let newzoom = 64 / ballPlayer.r;

    /** The linear interpolation of vector zoom to another vector,
     * the newzoom, is interpolating with coefficient 0.1.
     * This allows a smooth animation when the player's ball is growing.
     */
    zoom = lerp(zoom, newzoom, 0.1);

    /**Zoom allows player's ball to be always rendered
     * on the same size as the initial one (radius - 64 pixels on canvas),
     * If the radius of the player's ball is growing,
     * from the visual point of view it stays the same (radius - 64 pixels)
     * and this allows the rest of the balls to appear smaller on the player's canvas.
     */
    scale(zoom);

    /**After the zoom and scale were performed, the center of the ball is transposed
     * with ballPlayer.pos.x and ballPlayer.pos.y 
     * of the world back to the player's center of ball.
     */
    translate(-ballPlayer.pos.x, -ballPlayer.pos.y);
}

/**This function allows to display and update
 * the player's ball on the canvas.
 */
function displayBall(){

    /**Player sends his current position to the server
     * Message have form "pos:X_coordinate;Y_coordinate;Radius".
     */
    client.webSocket.send("pos:"+String(ballPlayer.pos.x)+";"+String(ballPlayer.pos.y)+";"+String(ballPlayer.r));

    /**This function constrain the center of ball in the game
     * canvas.Game canvas constants are stored in Constants.js.
     */
    ballPlayer.constrain();

    /**Invoke the method show from Ball class,
     * it permit to render the ball on canvas.
     */
    ballPlayer.show();

    /**If right click on mouse is pressed it update the player's ball.
     * It move the ball across the canvas based on the direction of mouse.
     */
    if (mouseIsPressed) {
        ballPlayer.update();
    }
}

/**This function display all the player's ball*/
function displayPlayers (){

    /**Iterate through Map of players balls.*/
    for (let [key,ball] of ballPlayers) {
        /**If the key is different of the current player ID.*/
        if(parseInt(id) !== parseInt(key)) {
            /**Display the other (key) player.*/
            fill(0,0,255);
            ball.show();

            /**Check if current player (id)
             * is eating the another one (key).
             */
            if (ballPlayer.eats(ball)){
                /**Sent to server that key player was eaten.*/
                client.webSocket.send("pEaten:"+key);

                /**Delete from client Map of players the key player.*/
                ballPlayers.delete(key);
            }
        }
    }
}

/**This function allows to display the "simply" balls.*/
function displayBalls () {
    /**Iterate through Map of "simply" balls.*/
    for(let [key,ball] of ballToEat){
        /**Display the "simply" ball (key).*/
        ball.show();

        /**Check if current player (id)
         * is eating a "simply" ball (key).
         */
        if (ballPlayer.eats(ball)) {
            /**Send to server id of the "simply" ball that was eaten.
             * Server will generate the another one with this id (key).
             */
            client.webSocket.send("bEaten:"+key);

            /**Delete from Map of "simply" balls
             * the ball what was eaten (key).*/
            ballToEat.delete(key);
        }
    }
}

/**Setup is one of 2 obligatory function in P5.js
 * The setup() function is called once when the program starts.
 * It's used to define initial environment properties such as
 * screen size and background color and to load media such as
 * images and fonts as the program starts. There can only be
 * one setup() function for each program and it shouldn't be
 * called again after its initial execution.
 * Note: Variables declared within setup() are not accessible
 * within other functions, including draw().
 */
function setup() {

    /**Create canvas on full Screen/*/
    createCanvas(window.innerWidth - 20,  window.innerHeight - 20);

    /**Set frame rate to default (30) FPS is declared in Constants.js.*/
    frameRate(FPS);

    /**Generate random coordinate of the player's ball.*/
    rand();

    /**Create new ball based on the player's
     * random generated coordinates.
     * */
    ballPlayer = new Ball(x,y, RAD_INIT_BALL);

    /**Here's a little trick,when he reach setTimeout,
     * it set timeout (100 ms) to send to the server coordinates
     * of a player's ball,and he enter in game,but connection
     * is not established yet,so it allows to connection to be
     * established before send the first message to the server.
     * Setup is the first function called,because of it connection
     * is not established yet.
     * Message have form "start:X_coordinate,Y_coordinate"
     */
    setTimeout(function(){
        client.send("start:"+x.toFixed(2)+";"+y.toFixed(2));
    }, 100);
}

/**Draw is another one of 2 obligatory function in P5.js
 * Called directly after setup(), the draw() function
 * continuously executes the lines of code contained
 * inside its block until the program is stopped or
 * noLoop() is called (Is called when player was eaten
 * by another player).
 * Note: Draw() is called automatically and should
 * never be called explicitly.
 */
function draw() {
    /**Display on canvas the Text about the Player's ball.*/
    myText();

    /**Translate the view of canvas to the center of ball.*/
    transl();

    /**Display the player's ball (id) on canvas.*/
    displayBall();

    /**Display all the players on canvas and
     * their interconnection with player.
     */
    displayPlayers();

    /**Display all the "simply" balls on canvas and
     * their interconnection with player.
     */
    displayBalls();
}

/**Function to resize canvas if window was changed.*/
function windowResized() {
    resizeCanvas(window.innerWidth - 20, window.innerHeight - 20);
}