/**A ball class which store position of the center of ball,
 * his radius,and his velocity on X vector and Y vector.
 * It also simulate the movement, display and process of eat
 * another balls,like "simply" ball (ball which are afk)
 * and player ball.
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 */
class Ball {

    /**A constructor of ball.It also create the vector
     * of velocity which is set on default(0,0).
     * @constructor
     * @param x the X coordinate of the center of the ball.
     * @param y the Y coordinate of the center of the ball.
     * @param r the radius of ball.
     */
    constructor (x,y,r){
        this.pos = createVector(x, y);
        this.r = r;

        /**Velocity(x_velocity,y_velocity).*/
        this.vel = createVector(0, 0);
    };

    /**Simulate the movement of the ball when
     * right click of mouse is pressed.
     */
    update = function() {
        /**create the new velocity based on the mouse cursor*/
        let newVel = createVector(mouseX - width / 2, mouseY - height / 2);

        /**Divide the vector of new velocity by 10,
         * to constrain his speed.
         * */
        newVel.div(10);

        /**Set limit of the speed 4 pixel per frame*/
        newVel.limit(4);

        /**Linear interpolate the vector of new velocity with 0.2*/
        this.vel.lerp(newVel, 0.2);

        /**Simulate the movement on canvas with
         * sum of coordinates and velocity.
         */
        this.pos.add(this.vel);
    };

    /**Simulate the process of eating another ball
     * Can be a "simple" ball or a player ball.
     * @param other the other ball what is checked.
     * @returns {boolean} if current ball eats other one.
     */
    eats = function(other) {
        /**Calculate the distance between 2 points,
         * Center of the player and the center of the
         * other balls which is checked.
         * @type {Number}
         */
        let d = p5.Vector.dist(this.pos, other.pos);

        /**Rad is the length of 2 radius,
         * the players and the other one*/
        let rad = parseFloat(this.r) + parseFloat(other.r);

        /**If the distance between players is smaller that sum of the radius,
         * balls have more than 1 common point,intersecting of the 2 circles,
         * and the player have bigger radius than the other one,
         * then player eats the other one.
         */
        if (d < rad && parseFloat(this.r) > parseFloat(other.r)) {
            /**To increase the player radius proportional*/
            let sum = PI * parseFloat(this.r) * parseFloat(this.r) + PI * parseFloat(other.r) * parseFloat(other.r);
            this.r = sqrt(sum / PI);
            return true;
        } else {
            return false;
        }
    };

    /**Function to render the player on canvas in p5.js*/
    show = function() {
        /**Color*/
        fill(255);

        /**Render a ball with player coordinates in center,and radius.*/
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };

    /**Function to constrain the player's ball in game canvas
     * with p5.js function constrain
     */
    constrain = function() {
        /**Constrain the x between the game canvas*/
        ballPlayer.pos.x = constrain(ballPlayer.pos.x, MIN_WIDTH , MAX_WIDTH);
        /**Constrain the y between the game canvas*/
        ballPlayer.pos.y = constrain(ballPlayer.pos.y, MIN_HEIGHT, MAX_HEIGHT );
    };
}