package Server;

import org.jetbrains.annotations.NotNull;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**Balls it's a class which si
 *
 */
public class Balls {
    public ConcurrentHashMap<String,Ball> hashMapBalls;
    Random randomValue = new Random();
    double precision = 1000D;
    public int n;
    float x,y;
    Balls(int n){
        this.n = n;
        hashMapBalls = new ConcurrentHashMap<>();
        for(int i = 0;i<n;i++)
            generateBall(i);
    }
    private synchronized void generateCoord(){
        x = (float) ((randomValue.nextInt((int) ((Constants.MAX_WIDTH - Constants.MIN_WIDTH) * precision + 1)) + Constants.MIN_WIDTH * precision)/precision);
        y = (float) ((randomValue.nextInt((int) ((Constants.MAX_HEIGHT - Constants.MIN_HEIGHT) * precision + 1)) + Constants.MIN_HEIGHT * precision)/precision);
    }
    public synchronized void generateBall(int i, @NotNull ConcurrentHashMap<String,Ball> map){
        //TODO GENERAREA NORMALA
        for(Ball ball : map.values()){
            generateCoord();
            while(between(x,ball.getX(),ball.getR()) &&
                    between(y,ball.getY(),ball.getR())){
                        generateCoord();
            }
            hashMapBalls.put(Integer.toString(i),new Ball(x,y,Constants.RAD_BALL_TO_EAT));
            System.out.println("Ball generated:"+i+"X:" + x + " Y:"+y);
            /*while ((ball.getX() + ball.getR() < x + Constants.RAD_BALL_TO_EAT || x <= Constants.MAX_WIDTH) &&
                    (Constants.MIN_HEIGHT <= y || y <= Constants.MAX_HEIGHT))
                        generateCoor();
            hashMapBalls.put(Integer.toString(i),new Ball(x,y,Constants.RAD_BALL_TO_EAT));*/
        }
    }
    public synchronized void generateBall(int i){
        generateCoord();
        hashMapBalls.put(Integer.toString(i),new Ball(x,y,Constants.RAD_BALL_TO_EAT));
    }

    private synchronized boolean between(float nr,float coord,float rad){
        float min = coord - rad;
        float max = coord + rad;
        return nr > min && nr < max;
    }
}
