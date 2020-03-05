package Server;

import org.jetbrains.annotations.NotNull;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

/**Represents a Server implementation using javax.websocket JSR 356 API.
 * WebSockets provide a bidirectional, full-duplex communications channel
 * that operates over HTTP through a single TCP/IP socket connection
 * Server implementation also extends Thread for threads synchronization.
 * App is  used to run on servlet container such as apache tomcat, Jetty, JBoss or GlassFish.
 * I'm using apache tomcat.
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.1
 * @since 1.0
 * Javax.websocket it's working in 4 stages,every stage contains specific annotation,
 * OnOpen, OnClose, OnMessage, onError.
 * 1 more annotation ServerEndpoint.
 * The ServerEndpoint annotation a class level annotation is used to denote
 * that a POJO is a web socket server and can be deployed as such.
 */
@ServerEndpoint(value = "/endpoint")
public class WebSocketServer extends Thread {

    /**sessions is used to store all sessions what are connected to server.
     * It use a ConcurrentHashMap because it support
     * full concurrency of retrievals and high expected concurrency for updates.
     * We need this because server is running in multithreading.
     */
    private static ConcurrentHashMap<String,Session> sessions = new ConcurrentHashMap<>();

    /**ballsPlayers is used to store all players ball on server.
     * It use a ConcurrentHashMap for the same reason as sessions.
     */
    private static ConcurrentHashMap<String,Ball> ballsPlayers = new ConcurrentHashMap<>();

    /**n store the number of afk balls, balls which are used to be eat.*/
    private static int n = 100;

    /**ballsToEat is a instance of Balls which are eaten,it's used for
     * generating all "simple| balls and for storing them.
     **/
    private static Balls ballsToEat = new Balls(n);

    /**OnOpen method level annotation is used to decorate a Java method
     * that wishes to be called when a new web socket session is open.
     *
     * @param session is the session of Client-Server which are started from Client.
     *                Client also use Websocket (Client was implemented in JavaScript).
     * @throws IOException it's throwing on session.getBasicRemote().sendText() when
     *                     Connection was interrupted on HandShake.
     */
    @OnOpen
    public synchronized void onOpen(@NotNull Session session) throws IOException {

        /**In the beginning current session is added to Sessions*/
        sessions.put(session.getId(),session);

        /**It's logged on Server what it's new connection*/
        System.out.println("onOpen::" + session.getId());

        /**Send the id of session back to the client,to store it.
        * All game logic are based on session id to identify the Ball*/
        session.getBasicRemote().sendText("id:"+session.getId());

        /**store the player and create a new ball associated to this player.*/
        ballsPlayers.put(session.getId(),new Ball(0,0,0));

        /**Broadcast the new player to the other*/
        broadcastBallsToOnePlayer(session);
    }

    /** OnClose method level annotation is used to decorate a Java method
     * that wishes to be called when a web socket session is closing.
     *
     * @param session is the current session what are closing.
     * @throws IOException is throwing when broadcastClose(session) is closed
     *                     and it's trying to send message.
     */
    @OnClose
    public synchronized void onClose(@NotNull Session session) throws IOException {
        /**Log*/
        System.out.println("onClose::" +  session.getId());

        /**Remove player from our containers*/
        ballsPlayers.remove(session.getId());
        sessions.remove(session.getId());

        /**Broadcast to other players what current
         * player (session.id()) is closed*/
        broadcastClose(session);
    }

    /** OnMessage method level annotation is used to make
     *  a Java method receive incoming web socket messages.
     *
     *  @param message
     *  @param session
     *  @throws IOException
     */
    @OnMessage
    public synchronized void onMessage(@NotNull String message, @NotNull Session session) throws IOException {
        /**Log*/
        System.out.println("onMessage::From=" + session.getId() + " Message=" + message);

        if(message.contains("bEaten:")){
            eatenBall(message);
        }
        else if(message.contains("pEaten:")){
            eatPlayer(message);
        }
        else if (message.contains("pos:")){
            broadcastPlayersToOnePlayer(message, session);
        }
    }

    /**
     * @param t
     */
    @OnError
    public synchronized void onError(@NotNull Throwable t) {
        System.out.println("onError::" + t.getMessage()+";"+t.getCause());
    }

    private synchronized void broadcastPlayersToOnePlayer(@NotNull String message, @NotNull Session session) {
        Parser parser = new Parser(message.substring(4));
        ballsPlayers.put(session.getId(), new Ball(parser.x, parser.y, parser.r));
        ballsPlayers.forEach((key, value) -> {
            synchronized (session) {
                try {
                    session.getBasicRemote().sendText("ballP:" + key + ";" + value.getX() + ";" + value.getY() + ";" + value.getR());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }
    private synchronized void broadcastBallsToOnePlayer(@NotNull Session session){
        ballsToEat.hashMapBalls.forEach((key, value) ->
                {
                    synchronized (session) {
                        try {
                            session.getBasicRemote().sendText("balls:" + key + ";" + value.getX() + ";" + value.getY());
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
        );
    }
    private synchronized void broadcastChangedBallToAllPlayer (String key,Ball ball) throws IOException {
        for(Session sessionTemp : sessions.values()){
            synchronized (sessionTemp) {
                sessionTemp.getBasicRemote().sendText("balls:" + key + ";" + ball.getX() + ";" + ball.getY());
            }
        }
    }
    private synchronized void eatenBall(@NotNull String message){
        String changedBall = message.substring(7);
        ballsToEat.generateBall(Integer.parseInt(changedBall),ballsPlayers);
        try {
            broadcastChangedBallToAllPlayer(changedBall, ballsToEat.hashMapBalls.get(changedBall));
        }
        catch (IOException e){
            e.printStackTrace();
        }
    }
    private synchronized void broadcastClose(Session session) throws IOException {
        for(Session sessionTemp :sessions.values()) {
            synchronized (sessionTemp) {
                sessionTemp.getBasicRemote().sendText("close:" + session.getId());
            }
        }
    }
    private synchronized void eatPlayer(@NotNull String message) throws IOException {
        String toDelete = message.substring(7);
        sessions.get(toDelete).getBasicRemote().sendText("alert");
        sessions.remove(toDelete);
        ballsPlayers.remove(toDelete);
    }
}