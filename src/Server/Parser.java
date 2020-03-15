package Server;

/**A parser class to parse the ball's date.
 * Message sent to parser has the following form:
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

    /**Parses message of a new player.
     *
     * @param message has form of "start:xCoordinates;yCoordinates"
     */
    public void parseStart(String message){
        String [] output = message.split(";");
        x = Float.parseFloat(output[0]);
        y = Float.parseFloat(output[1]);
    }
    /**parses the new position of the player(session.getId())
     * from where it was called.
     *
     * @param message has the form of "start:xCoordinates;yCoordinates"
     */
    public void parsePos(String message){
        String[] output = message.split(";");
        x = Float.parseFloat(output[0]);
        y = Float.parseFloat(output[1]);
        r = Float.parseFloat(output[2]);
    }
}
