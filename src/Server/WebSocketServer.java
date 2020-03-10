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
 * App is  used to run on servlet container such as apache Tomcat, Jetty, JBoss or GlassFish.
 * I'm using apache tomcat.
 * Before using it you need to create WAR or you can use mine in out/artifacts/Agar1_war_exploded.
 * This WAR, you need to deploy on servlet container such as Tomcat, Jetty, etc.
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

    /**Parser class*/
    Parser parser = new Parser();

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

        /**Log the new connection*/
        System.out.println("onOpen::" + session.getId());
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
        /**Log closed connection*/
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
     *  @param message message from session
     *  @param session current session
     *  @throws IOException is throwing when is trying to send message
     *                      to client, when session is closed in eatBall
     */
    @OnMessage
    public synchronized void onMessage(@NotNull String message, @NotNull Session session) throws IOException {
        /**Log specific message from session*/
        System.out.println("onMessage::From=" + session.getId() + " Message=" + message);

        /**Handle the situation when message is about
         * a "simply" ball(message) that is eaten by player(session.id()).
         * Message has form "bEaten:id_of_ball_that_was_eaten"
         */
        if(message.contains("bEaten:")){
            eatenBall(message);
        }

        else if(message.contains("start:")){
            createBall(session,message);
        }

        /**Handle the situation when message is about
         * a player(message) that was eaten by another player(session.id()).
         * Message has form "pEaten:id_of_player_that_was_eaten".
         */
        else if(message.contains("pEaten:")){
            eatPlayer(message);
        }

        /**Handle the situation when message is about
         * position updates of player (session.id())
         * Message has form "pos:x_coordinate;y_coordinate;radius"
         */
        else if (message.contains("pos:")){
            broadcastPlayersToOnePlayer(message, session);
        }
    }

    /**OnError method level annotation can be used to decorate a Java method
     * that wishes to be called in order to handle errors.
     * @param t error
     */
    @OnError
    public synchronized void onError(@NotNull Throwable t) {
        /**Log error*/
        System.out.println("onError::" + t.getMessage()+";"+t.getCause());
    }

    /**This function broadcast all data of players (ballsPlayers)
     * to one player (session.getId()).
     * It also update the current player position (message),
     * using a Parser class.
     * @param message the position of player (session.getId())
     *                and radius.Message has form :
     *                "pos:x_coordinate;y_coordinate;radius"
     * @param session session of current player.
     */
    private synchronized void broadcastPlayersToOnePlayer(@NotNull String message, @NotNull Session session) {
        /**Parsing x, y and radius*/
        parser.parsePos(message.substring(4));

        /**Updating the position of player (session.getId()*/
        ballsPlayers.put(session.getId(), new Ball(parser.x, parser.y, parser.r));

        /**Broadcast the data of other players to
         * current player (session.getId())
         */
        ballsPlayers.forEach((key, value) -> {
            /**It's used to synchronized the session,to not
             * access the same session by multiple threads,
             * otherwise it can throw IOException
             * "The remote endpoint was in state
             * [TEXT_FULL_WRITING] which is
             * an invalid state for called method"
             */
            synchronized (session) {
                /**Can throw IOException on
                 * session.getBasicRemote.sendText(),
                 * if the session was closed from client.
                 */
                try {
                    session.getBasicRemote().sendText("ballP:" + key + ";" + value.getX() + ";" + value.getY() + ";" + value.getR());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**This function broadcast all balls (ballsToEat)
     * to current player (session.getID()).
     * @param session current player.
     */
    private synchronized void broadcastBallsToOnePlayer(@NotNull Session session){
        ballsToEat.hashMapBalls.forEach((key, value) -> {
            /**It's used to synchronized the session,to not
             * access the same session by multiple threads,
             * otherwise it can throw IOException
             * "The remote endpoint was in state
             * [TEXT_FULL_WRITING] which is
             * an invalid state for called method"
             */
            synchronized (session) {
                /**Can throw IOException on
                 * session.getBasicRemote.sendText(),
                 * if the session was closed from client.
                 */
                try {
                    session.getBasicRemote().sendText("balls:" + key + ";" + value.getX() + ";" + value.getY());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**This function is used to broadcast changed ball
     * to all players (sessions).
     * @param key the ID of the ball.
     * @param ball the ball itself.
     * @throws IOException session.getBasicRemote.sendText(),
     *                     if the session was closed from client.
     */
    private synchronized void broadcastChangedBallToAllPlayer (String key,Ball ball) throws IOException {
        for(Session sessionTemp : sessions.values()){
            /**I'm not sure about this,to synchronize sessionTemp
             * because is local variable and it's generate every time
             * on new thread,but if it's not synchronized, client have
             * problems from time to time with draw the changed ball
             * To refactor later.
             */
            //TODO To refactor later javadoc.
            synchronized (sessionTemp) {
                sessionTemp.getBasicRemote().sendText("balls:" + key + ";" + ball.getX() + ";" + ball.getY());
            }
        }
    }

    /**This function is used to generate new "simply" ball
     * instead of eaten.
     *
     * @param message message with ball what we generate.
     *                message have form "bEaten:id_ball_eaten".
     */
    private synchronized void eatenBall(@NotNull String message){
        /**Because message have form "bEaten:id_ball_eaten"
         * changedBall extract the id of ball that was eaten.
         */
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
            /**I'm not sure about this,to synchronize sessionTemp
             * because is local variable and it's generate every time
             * on new thread,but if it's not synchronized, client have
             * problems from time to time with closing connection of
             * player (session.id()).
             */
            //TODO To refactor later javadoc.
            synchronized (sessionTemp) {
                sessionTemp.getBasicRemote().sendText("close:" + session.getId());
            }
        }
    }

    private synchronized void eatPlayer(@NotNull String message) throws IOException {
        //pEaten:
        //0123456
        String toDelete = message.substring(7);
        if (sessions.containsKey(toDelete)) {
            System.out.println(toDelete);
            sessions.get(toDelete).getBasicRemote().sendText("alert");
            sessions.remove(toDelete);
            ballsPlayers.remove(toDelete);
        }
    }

    private synchronized void createBall(@NotNull Session session, @NotNull String message) throws IOException {

        parser.parseStart(message.substring(6));

        /**store the player and create a new ball associated to this player.*/
        Ball tempBall = new Ball(parser.x,parser.y,Constants.RAD_INIT_BALL);
        ballsPlayers.put(session.getId(),tempBall);
        System.out.println("Created new Ball Id:"+session.getId()+" X:%d"+tempBall.getX()+ "Y:%d"+tempBall.getY());

        /**Send the id of session back to the client,to store it.
         * All game logic are based on session id to identify the Ball
         */
        session.getBasicRemote().sendText("id:"+session.getId());

        /**Broadcast the new player to the others*/
        broadcastBallsToOnePlayer(session);
    }
}