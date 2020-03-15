package Server;

import org.jetbrains.annotations.NotNull;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

/**Represents a Server implementation using javax.websocket JSR 356 API.
 * WebSockets provide a bidirectional, full-duplex communications channel
 * that operates over HTTP through a single TCP/IP socket connection.
 * Server implementation also extends Thread for threads synchronization.
 * The app is used to run on servlet container such as apache Tomcat, Jetty, JBoss or GlassFish.
 * I'm using apache tomcat.
 * Before using it you need to create WAR or you can use mine in out/artifacts/Agar1_war.
 * You need to deploy this WAR, on servlet container such as Tomcat, Jetty, etc.
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 * Javax.websocket is working in 4 stages, every stage contains a specific annotation,
 * OnOpen, OnClose, OnMessage, onError.
 * 1 more annotation ServerEndpoint.
 * The ServerEndpoint annotation a class level annotation is used to denote
 * that a POJO is a web socket server and can be deployed as such.
 */
@ServerEndpoint(value = "/endpoint")
public class WebSocketServer extends Thread {

    /**sessions is used to store all sessions which are connected to server.
     * It use a ConcurrentHashMap because it supports
     * full concurrency of retrievals and high expected concurrency for updates.
     * We need this because server is running in multithreading.
     */
    private static ConcurrentHashMap<String,Session> sessions = new ConcurrentHashMap<>();

    /**ballsPlayers is used to store all players ball on server.
     * It uses a ConcurrentHashMap for the same reason as sessions.
     */
    private static ConcurrentHashMap<String,Ball> ballsPlayers = new ConcurrentHashMap<>();

    /**n stores the number of afk balls, balls which are used to be eaten.*/
    private static int n = 100;

    /**ballsToEat is a instance of Balls which are eaten, it's used to
     * generate all "simple| balls and to store them.
     **/
    private static Balls ballsToEat = new Balls(n);

    /**Parser class*/
    Parser parser = new Parser();

    /**OnOpen method level annotation is used to decorate a Java method
     * that wishes to be called when a new web socket session is open.
     *
     * @param session is the session of Client-Server which is started from Client.
     *                Client also uses Websocket (Client was implemented in JavaScript).
     */
    @OnOpen
    public synchronized void onOpen(@NotNull Session session) {

        /**In the beginning, current session is added to Sessions*/
        sessions.put(session.getId(),session);

        /**Logs the new connection*/
        System.out.println("onOpen::" + session.getId());
    }

    /** OnClose method level annotation is used to decorate a Java method
     * that wishes to be called when a web socket session is closing.
     *
     * @param session is the current session which is closing
     * @throws IOException is throwing when broadcastClose(session) is closed
     *                     and it's trying to send message.
     */
    @OnClose
    public synchronized void onClose(@NotNull Session session) throws IOException {
        /**Logs closed connection*/
        System.out.println("onClose::" +  session.getId());

        /**Removes player from our containers*/
        ballsPlayers.remove(session.getId());
        sessions.remove(session.getId());

        /**Broadcasts to other players that the current
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
        /**Logs a specific message from session*/
        System.out.println("onMessage::From=" + session.getId() + " Message=" + message);

        /**Handles the situation when message is about
         * a "simple" ball (message) that is eaten by the player(session.id()).
         * The message has form of "bEaten:id_of_ball_that_was_eaten"
         */
        if(message.contains("bEaten:")){
            eatenBall(message);
        }

        /**Handles the situation when the message is about
         * new connection from a client.
         * Client sends the initial coordinates of the generated ball,
         * and the server stores it.
         * The message has the following form "start:x_coordinates,y_coordinates.
         */
        else if(message.contains("start:")){
            createBall(session,message);
        }

        /**Handles the situation when the message is about
         * a player(message) that was eaten by another player(session.id()).
         *The message has the following form "pEaten:id_of_player_that_was_eaten".
         */
        else if(message.contains("pEaten:")){
            eatPlayer(message);
        }

        /**Handles the situation when message is about
         * updates the of the players (session.id())
         * The message has form "pos:x_coordinate;y_coordinate;radius"
         */
        else if (message.contains("pos:")){
            broadcastPlayersToOnePlayer(message, session);
        }

        /**Handles the situation when the message
         * has a different form, than expected.
         */
        else {
            System.out.println("Message has different form than expected,message="+message);
        }
    }

    /**OnError method level annotation can be used to decorate a Java method
     * that wishes to be called in order to handle errors.
     *
     * @param t error
     */
    @OnError
    public synchronized void onError(@NotNull Throwable t) {
        /**Log error*/
        System.out.println("onError::" + t.getMessage()+", Cause::"+t.getCause());
    }

    /**This function broadcasts all data players (ballsPlayers)
     * to one player (session.getId()).
     * It also updates the current player position (message),
     * using a Parser class.
     *
     * @param message the position of the player (session.getId())
     *                and radius. The message has the following form :
     *                "pos:x_coordinate;y_coordinate;radius"
     * @param session session of current player.
     */
    private synchronized void broadcastPlayersToOnePlayer(@NotNull String message, @NotNull Session session) {
        /**Checks if the player is in sessions. To prevent mistakes from the client,
         * the ball can be added only on open session.
         * */
        if(sessions.containsKey(session.getId())) {
            /**Parsing x, y and radius*/
            parser.parsePos(message.substring(4));

            /**Updating the position of the player (session.getId()*/
            ballsPlayers.put(session.getId(), new Ball(parser.x, parser.y, parser.r));

            /**Broadcasts the data of the other players to
             * the current player (session.getId())
             */
            ballsPlayers.forEach((key, value) -> {
                /**It's used to synchronize the session,to not
                 * access the same session by multiple threads,
                 * otherwise it can throw IOException
                 * "The remote endpoint was in state
                 * [TEXT_FULL_WRITING] which is
                 * an invalid state for called method"
                 */
                synchronized (session) {
                    /**Can throw IOException on
                     * session.getBasicRemote.sendText(),
                     * if the session was closed by the client.
                     */
                    try {
                        session.getBasicRemote().sendText("ballP:" + key + ";" + value.getX() + ";" + value.getY() + ";" + value.getR());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    /**This function broadcasts all balls (ballsToEat)
     * to the current player (session.getID()).
     *
     * @param session current player.
     */
    private synchronized void broadcastBallsToOnePlayer(@NotNull Session session){
        ballsToEat.hashMapBalls.forEach((key, value) -> {
            /**It's used to synchronize the session,to not
             * access the same session by multiple threads,
             * otherwise it can throw IOException
             * "The remote endpoint was in state
             * [TEXT_FULL_WRITING] which is
             * an invalid state for the called method"
             */
            synchronized (session) {
                /**Can throw IOException on
                 * session.getBasicRemote.sendText(),
                 * if the session was closed by the client.
                 */
                try {
                    session.getBasicRemote().sendText("balls:" + key + ";" + value.getX() + ";" + value.getY());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**This function is used to broadcast the changed ball
     * to all players (sessions).
     *
     * @param key the ID of the ball.
     * @param ball the ball itself.
     * @throws IOException session.getBasicRemote.sendText(),
     *                     if the session was closed by client.
     */
    private synchronized void broadcastChangedBallToAllPlayer (String key,Ball ball) throws IOException {
        for(Session sessionTemp : sessions.values()){
            /**I'm not sure about this,to synchronize sessionTemp
             * because it is a local variable and it's generated every time
             * on the new threads, but if it's not synchronized, the client will have
             * problems from time to time with drawing the changed ball
             */
            synchronized (sessionTemp) {
                sessionTemp.getBasicRemote().sendText("balls:" + key + ";" + ball.getX() + ";" + ball.getY());
            }
        }
    }

    /**This function is used to generate new "simple" ball
     * instead of eaten.
     *
     * @param message the message with ball that we generate.
     *                the message has the following form "bEaten:id_ball_eaten".
     */
    private synchronized void eatenBall(@NotNull String message){
        /**Because the message has the following form "bEaten:id_ball_eaten"
         * changedBall extracts the id of the ball which was eaten.
         */
        String changedBall = message.substring(7);

        /**Generates new coordinates of the ball which was eaten,
         * based on the id(changedBall).
         */
        ballsToEat.generateBall(Integer.parseInt(changedBall));

        /**Broadcasts changed "simple" ball (changedBall)
         * for all the players(from sessions).
         * Can throw IOException if
         * session.getBasicRemote.sendText(), from broadcastChangedBall...
         * if the session was closed by the client.
         */
        try {
            broadcastChangedBallToAllPlayer(changedBall, ballsToEat.hashMapBalls.get(changedBall));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**Broadcasts closed connection to other players,
     * to delete from their Map of players(to not render).
     *
     * @param session the session which was closed.
     * @throws IOException sessionTemp.getBasicRemote.sendText(),
     *                     if the session(sessionTemp) was closed by
     *                     the client.
     */
    private synchronized void broadcastClose(Session session) throws IOException {
        for(Session sessionTemp :sessions.values()) {
            /**I'm not sure about this,to synchronize sessionTemp
             * because it is a local variable and it's generated every time
             * on new threads ,but if it's not synchronized, client will have
             * problems from time to time with the closing connection of
             * the player (session.id()).
             */
            //TODO To refactor later javadoc.
            synchronized (sessionTemp) {
                sessionTemp.getBasicRemote().sendText("close:" + session.getId());
            }
        }
    }

    /**A situation when a player eats another player.
     * In this case, the player that was eaten will be deleted from
     * the list of players(sessions) and so will his ball (ballsPlayers).
     *
     * @param message the message about an eaten player.
     *                The message has the following form "pEaten:id_of_eaten_player".
     * @throws IOException sessions.get(toDelete).getBasicRemote().sendText()
     *                     if the connection was closed from by the client side.
     */
    private synchronized void eatPlayer(@NotNull String message) throws IOException {
        /**Because the message has the following form "pEaten:id_of_eaten_player",
         * We extract the id of the eaten player.
         */
        String toDelete = message.substring(7);

        /**If the string was not deleted before(can be because of the speed of
         * Websocket,it can send 2 times the same message),
         * it will be deleted now.
         */
        if (sessions.containsKey(toDelete)) {
            /**Logs the deleted player */
            System.out.println("Delete player:"+toDelete);

            /**Sends the player that the "alert message" should be deleted.
             * The connection will be closed by him, and throw out the message
             * which was eaten.
             */
            sessions.get(toDelete).getBasicRemote().sendText("alert");

            /**Deletes the player(toDelete) from the other players session (sessions)
             * and from players ball(ballsPlayers).
             */
            sessions.remove(toDelete);
            ballsPlayers.remove(toDelete);
        }
    }

    /**Creates a new player ball (session.getId()) and sends
     * the notification about this to other balls in order for them to render the balls.
     *
     * @param session current session
     * @param message the message from session.
     *                The message has the following form "start:id_of_a_new_ball"
     * @throws IOException session.getBasicRemote().sendText()
     *                     if the connection was closed from client side.
     */
    private synchronized void createBall(@NotNull Session session, @NotNull String message) throws IOException {
        /**Subtract the ID of the new ball,
         * Message has the form of "start:id_of_a_new_ball".
         */
        parser.parseStart(message.substring(6));

        /**stores the player and creates a new ball associated to this player.*/
        Ball tempBall = new Ball(parser.x, parser.y, Constants.RAD_INIT_BALL);
        ballsPlayers.put(session.getId(), tempBall);

        /**Logs the new ball*/
        System.out.println("Created new Ball Id:" + session.getId() + " X:%d" + tempBall.getX() + "Y:%d" + tempBall.getY());

        /**Sends the id of the session back to the client, to store it.
         * All the game's logic is based on the session's id to identify the Ball
         */
        session.getBasicRemote().sendText("id:" + session.getId());

        /**Broadcasts the new player to the other ones*/
        broadcastBallsToOnePlayer(session);
    }
}