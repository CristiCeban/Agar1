package Server;

/**A parser class to parse the ball's date from player
 * Message sent to parser have form:
 * "xCoord;yCoord;radius"
 */
public class Parser {
    public float x,y,r;
    public float message;
    Parser(){}
    public void parseStart(String message){
        String [] output = message.split(";");
        x = Float.parseFloat(output[0]);
        y = Float.parseFloat(output[1]);
    }
    public void parsePos(String message){
        String[] output = message.split(";");
        x = Float.parseFloat(output[0]);
        y = Float.parseFloat(output[1]);
        r = Float.parseFloat(output[2]);
    }
}
