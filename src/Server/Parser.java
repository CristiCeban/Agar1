package Server;

/**A parser class to parse the ball's date from player
 * Message sent to parser have form:
 * "xCoordinates;yCoordinates;radius".
 * or "start:xCoordinates;yCoordinates".
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 */
public class Parser {
    public float x,y,r;
    public float message;
    Parser(){}

    /**Parse message of a new player.
     *
     * @param message has form "start:xCoordinates;yCoordinates"
     */
    public void parseStart(String message){
        String [] output = message.split(";");
        x = Float.parseFloat(output[0]);
        y = Float.parseFloat(output[1]);
    }
    /**parse the new position of player(session.getId())
     * from where it was called.
     *
     * @param message has form "start:xCoordinates;yCoordinates"
     */
    public void parsePos(String message){
        String[] output = message.split(";");
        x = Float.parseFloat(output[0]);
        y = Float.parseFloat(output[1]);
        r = Float.parseFloat(output[2]);
    }
}
