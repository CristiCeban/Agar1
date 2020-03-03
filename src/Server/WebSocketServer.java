package Server;

import org.jetbrains.annotations.NotNull;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/endpoint")
public class WebSocketServer extends Thread {
    private static ConcurrentHashMap<String,Session> sessions = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<String,Ball> ballsPlayers = new ConcurrentHashMap<>();
    private static int n = 20;
    private static Balls ballsToEat = new Balls(n);

    @OnOpen
    public synchronized void onOpen(@NotNull Session session) throws IOException {
        sessions.put(session.getId(),session);
        System.out.println("onOpen::" + session.getId());
        session.getBasicRemote().sendText("id:"+session.getId());
        ballsPlayers.put(session.getId(),new Ball(0,0,0));
        broadcastBallsToOnePlayer(session);
    }

    @OnClose
    public synchronized void onClose(@NotNull Session session) {
        System.out.println("onClose::" +  session.getId());
        try {
            ballsPlayers.remove(session.getId());
            sessions.remove(session.getId());
            broadcastClose(session);
        }
        catch (Exception e){
            e.printStackTrace();
        }
    }

    @OnMessage
    public synchronized void onMessage(String message, @NotNull Session session) {
        System.out.println("onMessage::From=" + session.getId() + " Message=" + message);
        if(message.contains("bEaten:")){
            eatenBall(message);
        }
        else if (message.contains("pos:")){
            broadcastPlayersToOnePlayer(message, session);
        }
    }

    @OnError
    public synchronized void onError(@NotNull Throwable t) {
        System.out.println("onError::" + t.getMessage()+";"+t.getCause());
    }

    private synchronized void broadcastPlayersToOnePlayer(String message, @NotNull Session session) {
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
    private synchronized void eatenBall(String message){
        String changedBall = message.substring(7);
        ballsToEat.generateBall(Integer.parseInt(changedBall),ballsPlayers);
        //ballsToEat.generateBall(Integer.parseInt(changedBall));
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

}