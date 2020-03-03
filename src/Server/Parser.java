package Server;

public class Parser {
    public float x,y,r;
    public float message;
    Parser(String message){
        String[] output = message.split(";");
        x = Float.parseFloat(output[0]);
        y = Float.parseFloat(output[1]);
        r = Float.parseFloat(output[2]);
    }
}
