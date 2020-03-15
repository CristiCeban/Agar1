/**A ball class which store position of the center of ball,
 * his radius,and his velocity on X vector and Y vector.
 * It also simulates the movement, display and the process of eating
 * other balls, like the "simple" ball (balls which are afk)
 * and player balls.
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 */
class Ball {

    /**A constructor of ball. It also creates the vector
     * of velocity which is set on default(0,0).
     * @constructor
     * @param x coordinate X of the center of the ball.
     * @param y coordinate Y of the center of the ball.
     * @param r radius of ball.
     */
    constructor (x,y,r){
        this.pos = createVector(x, y);
        this.r = r;

        /**Velocity(x_velocity,y_velocity).*/
        this.vel = createVector(0, 0);
    };

    /**Simulates the movement of the ball when
     * the right click of mouse is pressed.
     */
    update = function() {
        /**creates the new velocity based on the mouse cursor position.*/
        let newVel = createVector(mouseX - width / 2, mouseY - height / 2);

        /**The vector of new velocity is divided
         * by 10 to constrain his speed.
         * */
        newVel.div(10);

        /**Sets limit of the speed 4 pixel per frame.*/
        newVel.limit(4);

        /**Linear interpolate of vector of the new velocity
         * with coefficient 0.2.
         */
        this.vel.lerp(newVel, 0.2);

        /**Simulates the movement on canvas with
         * sum of coordinates and velocity.
         */
        this.pos.add(this.vel);
    };

    /**Simulates the process of eating another ball
     * Can be a "simple" ball or a player ball.
     * @param other the other ball which is checked.
     * @returns {boolean} if current ball eats the other one.
     */
    eats = function(other) {
        /**Calculates the distance between 2 points,
         * The center of the player and the center of
         * other balls which are checked.
         * @type {Number}
         */
        let d = p5.Vector.dist(this.pos, other.pos);

        /**Rad is the length of 2 radiuses,
         * the players and the other one*/
        let rad = parseFloat(this.r) + parseFloat(other.r);

        /**If the distance between players is smaller than the sum of the radiuses,
         * balls have more than 1 common point,intersecting the 2 circles,
         * and the player has a bigger radius than the other one,
         * then the player eats the other one.
         */
        if (d < rad && parseFloat(this.r) > parseFloat(other.r)) {
            /**To increase the player's radius proportionally*/
            let sum = PI * parseFloat(this.r) * parseFloat(this.r) + PI * parseFloat(other.r) * parseFloat(other.r);
            this.r = sqrt(sum / PI);
            return true;
        } else {
            return false;
        }
    };

    /**Function which renders the player on canvas in p5.js*/
    show = function() {
        /**Color WHITE*/
        fill(255);

        /**Renders a ball with the player's coordinates in the center,and radius r.*/
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };

    /**Function which constrains the player's ball in the game's canvas
     * with p5.js function constrain
     */
    constrain = function() {
        /**Constrains the coordinate x between the game's canvas*/
        ballPlayer.pos.x = constrain(ballPlayer.pos.x, MIN_WIDTH , MAX_WIDTH);
        /**Constrains the coordinate y between the game's canvas*/
        ballPlayer.pos.y = constrain(ballPlayer.pos.y, MIN_HEIGHT, MAX_HEIGHT );
    };
}