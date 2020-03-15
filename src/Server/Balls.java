package Server;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**Balls it's a class which stores all "simple" ball which are eaten.
 * It also has the method to generate coordinates x and y of a new ball
 * based on the ID of the ball. On the start of server Balls generate all n balls,
 * And when a ball is eaten it will generate the new coordinates only for this ball.
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 */
public class Balls {
     /** It uses a ConcurrentHashMap because it supports
      * full concurrency of retrievals and high expected concurrency for updates.
      * We need this because server is running in multithreading and the access to
      * all the balls need to be in concurrency.
      */
    public ConcurrentHashMap<String,Ball> hashMapBalls;

    /**Random is used to generate the random float between the
     * Max and Min Width/Height, which are constant.
     */
    private Random randomValue = new Random();

    /**N store the number of "simple" balls*/
    public int n;

    /**X and Y are the coordinates which are needed to be generated.
     * For every new ball they are generated again.
     */
    private float x,y;

    /**The simple constructor to generate and store all n "simple" balls.
     *
     * @param n the number of "simple" ball.
     */
    Balls(int n){
        this.n = n;
        hashMapBalls = new ConcurrentHashMap<>();
        /**generates n balls with id = i and stores them in Map.*/
        for(int i = 0;i<n;i++)
            generateBall(i);
    }

    /** The function to generate coordinates.
     * It assigns new values to x and y.
     */
    private synchronized void generateCoord(){
        /**Precision of the generated coordinates.*/
        double precision = 1000D;
        x = (float) ((randomValue.nextInt((int) ((Constants.MAX_WIDTH - Constants.MIN_WIDTH) * precision + 1)) + Constants.MIN_WIDTH * precision)/ precision);
        y = (float) ((randomValue.nextInt((int) ((Constants.MAX_HEIGHT - Constants.MIN_HEIGHT) * precision + 1)) + Constants.MIN_HEIGHT * precision)/ precision);
    }

    /**Function to generate coordinates,
     * creates new balls with generated coordinates
     * and stores them in hashMapBalls.
     */
    public synchronized void generateBall(int i){
        generateCoord();
        hashMapBalls.put(Integer.toString(i),new Ball(x,y,Constants.RAD_BALL_TO_EAT));
    }
}
