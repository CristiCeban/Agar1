# Agar1
My app consists of 2 parts, Client-side, which is implemented in JS using WebSocket for connection to server and p5.js lib for all the graphics and renders. The server side is implemented in Java using javax.websocket JSR 356 API.
WebSockets provide a bidirectional, full-duplex communications channel
that operates over HTTP through a single TCP/IP socket connection.
Server implementation also extends Thread for threads synchronization.
The app is  used to run on the servlet container, such as apache Tomcat, Jetty, JBoss or GlassFish.
I'm using apache tomcat.
 Before using it you need to create WAR  or you can use mine in out/artifacts/Agar1_war.
Endpoint value is “endpoint”.
You have  to deploy this WAR on servlet container such as Tomcat, Jetty, etc.
I am using Tomcat 9 integrated in IDEA, you can use yours from IDEA -https://mkyong.com/intellij/intellij-idea-run-debug-web-application-on-tomcat/
Or you can deploy particulary Tomcat:
https://www.youtube.com/watch?v=pKMgr8uNvGM
You also need JDK:
https://www.youtube.com/watch?v=F18gNbCCOm4
After deploying the WAR on Tomcat, just open src/client/index.html and client will connect to the server.
For further documentation how it works,check out the javadoc and JS doc.
