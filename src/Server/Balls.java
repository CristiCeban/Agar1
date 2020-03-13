package Server;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**Balls it's a class which store all "simply" ball what are eaten.
 * It also have the method to generate coordinates x and y of a new ball
 * based on the ID of ball.On the start of server Balls generate all n balls,
 * And when a ball was eaten it will generate the new coordinates only for this ball.
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 */
public class Balls {
     /** It use a ConcurrentHashMap because it support
      * full concurrency of retrievals and high expected concurrency for updates.
      * We need this because server is running in multithreading and access to
      * all balls need to be concurrency.
      */
    public ConcurrentHashMap<String,Ball> hashMapBalls;

    /**Random is used for generate the random float between the
     * Max and Min Width/Height, which are constant.
     */
    private Random randomValue = new Random();

    /**N store the number of "simply" ball*/
    public int n;

    /**X and Y are the coordinates which are needed to be generated.
     * For every new ball they are generated again.
     */
    private float x,y;

    /**Simply constructor to generate and store all n "simply" balls.
     *
     * @param n the number of "simply" ball.
     */
    Balls(int n){
        this.n = n;
        hashMapBalls = new ConcurrentHashMap<>();
        /**generate n balls with id = i and store them in Map.*/
        for(int i = 0;i<n;i++)
            generateBall(i);
    }

    /**Function to generate coordinates.
     * It assign the new values to x and y.
     */
    private synchronized void generateCoord(){
        /**Precision of the generated coordinates.*/
        double precision = 1000D;
        x = (float) ((randomValue.nextInt((int) ((Constants.MAX_WIDTH - Constants.MIN_WIDTH) * precision + 1)) + Constants.MIN_WIDTH * precision)/ precision);
        y = (float) ((randomValue.nextInt((int) ((Constants.MAX_HEIGHT - Constants.MIN_HEIGHT) * precision + 1)) + Constants.MIN_HEIGHT * precision)/ precision);
    }

    /**Function to generate coordinates,
     * create new ball with generated coordinates
     * and store them in hashMapBalls.
     */
    public synchronized void generateBall(int i){
        generateCoord();
        hashMapBalls.put(Integer.toString(i),new Ball(x,y,Constants.RAD_BALL_TO_EAT));
    }
}
