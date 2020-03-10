package Server;

import java.util.Random;

/**Ball is a class to simulate ball.
 * 1-st member x - it's the x position of the center of the Ball.
 * 2-nd member y - it's the y position of the center of the Ball.
 * 3-nd member r - it-s the radius of ball.
 */
public class Ball {

    private float x;
    private float y;
    private float r;

    public Ball(float x, float y, float r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
    public Ball(float r){
        generateCoord();
        this.r = r;
    }
    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public float getR() {
        return r;
    }

    public void setR(float r) {
        this.r = r;
    }

    private synchronized void generateCoord(){
        Random randomValue = new Random();
        double precision = 1000D;
        x = (float) ((randomValue.nextInt((int) ((Constants.MAX_WIDTH - Constants.MIN_WIDTH) * precision + 1)) + Constants.MIN_WIDTH * precision)/precision);
        y = (float) ((randomValue.nextInt((int) ((Constants.MAX_HEIGHT - Constants.MIN_HEIGHT) * precision + 1)) + Constants.MIN_HEIGHT * precision)/precision);
    }
}
