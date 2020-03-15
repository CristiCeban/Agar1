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
let client = new WebSocketClient('ws', 'localhost', 8080, '/Agar1_war/endpoint');

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
     * from the screen center with ballPlayer.pos.x and ballPlayer.pos.y.
     * Translate allows the center of the ball to be in the same point as the screen center.
     * This is made with the purpose for all the game logic to be surrounded by the player's ball.
     */
    translate(-ballPlayer.pos.x, -ballPlayer.pos.y);
}

/**This function allows to display and update
 * the player's ball on the canvas.
 */
function displayBall(){

    /**Player sends his current position to the server
     * The form of the message is "pos:X_coordinate;Y_coordinate;Radius".
     */
    client.webSocket.send("pos:"+String(ballPlayer.pos.x)+";"+String(ballPlayer.pos.y)+";"+String(ballPlayer.r));

    /**This function constrains the ball center in the game canvas.
     * The game canvas constants are stored in Constants.js.
     */
    ballPlayer.constrain();

    /**Invokes the method show from Ball class,
     * it permits to render the ball on canvas.
     */
    ballPlayer.show();

    /**If the right click of mouse is pressed it updates the player's ball.
     * It moves the ball across the canvas based on the direction of mouse.
     */
    if (mouseIsPressed) {
        ballPlayer.update();
    }
}

/**This function displays all the player's ball*/
function displayPlayers (){

    /**Iterates through Map of players balls.*/
    for (let [key,ball] of ballPlayers) {
        /**If the key is different of the current player ID.*/
        if(parseInt(id) !== parseInt(key)) {
            /**Display the other (key) player.*/
            fill(0,0,255);
            ball.show();

            /**Checks if the current player (id)
             * is eating the other one (key).
             */
            if (ballPlayer.eats(ball)){
                /**Sends to server that the key player was eaten.*/
                client.webSocket.send("pEaten:"+key);

                /**Deletes from client Map of players the key player.*/
                ballPlayers.delete(key);
            }
        }
    }
}

/**This function allows to display the "simple" balls.*/
function displayBalls () {
    /**Iterates through Map of "simple" balls.*/
    for(let [key,ball] of ballToEat){
        /**Displays the "simple" ball (key).*/
        ball.show();

        /**Checks if current player (id)
         * is eating a "simple" ball (key).
         */
        if (ballPlayer.eats(ball)) {
            /**Sends to  server the id of the "simple" ball which was eaten.
             * Server will generate the another one with this id (key).
             */
            client.webSocket.send("bEaten:"+key);

            /**Deletes from Map of "simple" balls
             * the ball which was eaten (key).*/
            ballToEat.delete(key);
        }
    }
}

/**Setup is one of 2 obligatory functions in P5.js
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

    /**Creates canvas on the full Screen/*/
    createCanvas(window.innerWidth - 20,  window.innerHeight - 20);

    /**Sets the frame rate to default (30). FPS is declared in Constants.js.*/
    frameRate(FPS);

    /**Generates the random coordinate of the player's ball.*/
    rand();

    /**Creates new ball based on the player's
     * random generated coordinates.
     * */
    ballPlayer = new Ball(x,y, RAD_INIT_BALL);

    /**Here's a little trick, when he reaches setTimeout,
     * it sets timeout (100 ms) to send to the server coordinates
     * of a player's ball, and he enters in game, but the connection
     * has not been established yet, so it allows the connection to be
     * established before the first message is sent to the server.
     * Setup is the first function called, because of it, connection
     * has not been established yet.
     * The message form is "start:X_coordinate,Y_coordinate"
     */
    setTimeout(function(){
        client.send("start:"+x.toFixed(2)+";"+y.toFixed(2));
    }, 100);
}

/**Draw() is another one of the 2 obligatory functions in P5.js
 * Called directly after setup(), the draw() function
 * continuously executes the lines of code containing
 * inside its block until the program is stopped or
 * noLoop() is called (Is called when one player was eaten
 * by another player).
 * Note: Draw() is called automatically and should
 * never be called explicitly.
 */
function draw() {
    /**Displays on canvas the Text about the Player's ball.*/
    myText();

    /**Translates the view of canvas to the center of ball.*/
    transl();

    /**Displays the player's ball (id) on canvas.*/
    displayBall();

    /**Displays2 all the players on canvas and
     * their interconnection with player (id).
     */
    displayPlayers();

    /**Displays all the "simple" balls on canvas and
     * their interconnection with player.
     */
    displayBalls();
}

/**Function to resize canvas if window was changed.*/
function windowResized() {
    resizeCanvas(window.innerWidth - 20, window.innerHeight - 20);
}