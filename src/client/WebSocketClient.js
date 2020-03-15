/**A Websocket client class which implements WebSocket in JS.
 * WebSockets provides a bidirectional, full-duplex communications channel
 * that operates over HTTP through a single TCP/IP socket connection.
 * At default it sets on ws://127.0.0.1/8080/Agar1_war/endpoint.
 * where "endpoint" is the value of the endpoint on the server side.
 * @author Ceban Cristian
 * @author cebancristi4444@gmail.com
 * @version 1.2
 * @since 1.0
 */
class WebSocketClient {
    /**A standard constructor.
     *
     * @constructor
     * @param protocol the protocol which will be used.
     * @param hostname the hostname which will be used.
     * @param port the port on which connection will be deployed.
     * @param endpoint the name of the endpoint (value on the server side).
     */
    constructor(protocol, hostname, port, endpoint) {
        this.webSocket = null;
        this.protocol = protocol;
        this.hostname = hostname;
        this.port = port;
        this.endpoint = endpoint;
    }

    /**returns server's url on which connection is deployed */
    getServerUrl() {
        return this.protocol + "://" + this.hostname + ":" + this.port + this.endpoint;
    }

    /**Connects the websocket to the server (through getServerUrl()).
     * It also overrides the basic functions on webSocket
     * onopen, onmessage, onclose, onerror.
     */
    connect() {
        /**The process of connection to the server can throw IOException if
         * the server is closed or the connection is not available.
         */
        try {
            /**Creates a new websocket from the given server URL.*/
            this.webSocket = new WebSocket(this.getServerUrl());

            /**Overrides the method onopen from webSocket,
             * The method is invoked when the connection
             * between the client and server is made.
             *
             * @param event the current event.
             */
            this.webSocket.onopen = function (event) {
                /**The opening connection is logging*/
                console.log('onopen::' + JSON.stringify(event, null, 4));
            };

            /**Overrides the method onmessage from webSocket,
             * The method is invoked when the client receives
             * a message from server.
             *
             * @param event the event message.
             */
            this.webSocket.onmessage = function (event) {
                /**extracts the message information from event*/
                let msg = event.data;

                /**Handles the situation when message is about
                 * the received id from the server.
                 * It stores the id in the field id.
                 * Message has the following form: "id:id_number".
                 */
                if (msg.includes("id:")) {
                    /**Stores the id generated from the server*/
                    id = msg.substring(3);

                    /**The receiving ID is logging*/
                    console.log("Received ID:"+id);

                }

                /**Handles the situation when message is about
                 * "simple" ball, at the beginning of the connection, Server sends
                 * n "simple" ball to the client, and when the client eats one
                 * of the "simple" balls, server sends to the client the new coordinates
                 * of a "i(toSearch)" simple ball
                 */
                else if (msg.includes("balls:")){
                    /**Message has following form "balls:id_of_simply_ball;X_coord;Y_coord",
                     * toSearch parses the useful information about the ball.
                     * @type {string}
                     */
                    let toSearch = msg.substring(6);

                    /**Splits useful information into:
                     * res[0] = id of a "simple" ball.
                     * res[1] = X coordinate of the center of a "simple" ball.
                     * res[2] = Y coordinate of the center of a "simple" ball.
                     *
                     * @type {string[]}
                     */
                    let res = toSearch.split(";");

                    /**Puts into the Map of the "simple" ball the information about the new ball (res[0]).
                     * The simple ball has the radius RAD_BALL_TO_EAT, which is constant.
                     * */
                    ballToEat.set(res[0], new Ball(res[1],res[2],RAD_BALL_TO_EAT));
                }

                /**Handles the situation when the message is about
                 * information about a player from Server.
                 * The message has the following form:
                 * "ballP:id;X_coordinate;Y_coordinate;radius"
                 */
                else if (msg.includes("ballP:")){
                    /**toSearch parses the useful information about the ball
                     *
                     * @type {string}
                     */
                    let toSearch = msg.substring(6);

                    /**Splits the useful information into:
                     * res[0] = ID of a player's ball.
                     * res[1] = X coordinate of the center of a player's ball,
                     * res[2] = Y coordinate of the center of a player's ball.
                     * res[3] = Radius of the player's ball.
                     *
                     * @type {string[]}
                     */
                    let res = toSearch.split(";");

                    /**Puts into the Map the player's ball.
                     * It is used to update the locations of the player from server.
                     */
                    ballPlayers.set(res[0], new Ball(res[1], res[2], res[3]));
                }

                /**Handles the situation when current player
                 * is eaten by an another, bigger player.
                 */
                else if (msg.includes("alert")){
                    /**Is logging when the player is eaten(by alert).*/
                    console.log("Message alert:" + JSON.stringify(msg,null,4));
                    //TODO Normal exit on the client side of the eaten player.
                    /**Alerts player*/
                    alert("You were eaten!");

                    /**p5.js the function that stops drawing loop and removes canvas.*/
                    remove();
                }

                /**Handles the situation when a player has left the game.*/
                else if (msg.includes("close:")){
                    /**Delete player (by playerID) from Map with all the players.*/
                    ballPlayers.delete(msg.substring(6));

                    /**Logs the deleted player.*/
                    console.log(msg.substring(6));
                }

                /**Handles the situation when the message
                 * had a different form, from the ones which were expected.
                 */
                else {
                    console.log(" The message has a different form than expected, message="+msg);
                }
            };

            /**Overrides the method onclose from webSocket,
             * The method is invoked when the client or the server
             * is closing the connection.
             *
             * @param event the message.
             */
            this.webSocket.onclose = function (event) {
                /**Logs the closing state*/
                console.log('onclose::' + JSON.stringify(event, null, 4));

                /**Deletes player's data */
                ballPlayers.delete(id);
            };
            /**Overrides the method onerror from webSocket,
             * The method is invoked when an error is thrown
             * on server, or on the client side.
             *
             * @param event the message.
             */
            this.webSocket.onerror = function (event) {
                /**Logs the error*/
                console.log('onerror::' + JSON.stringify(event, null, 4));
            }

        }

        /** The process of connection to the server can throw IOException if
         * the server is closed or the connection is not available.
         */
        catch (exception) {
            console.error(exception);
        }
    }

    /**Disconection from the server.*/
    disconnect() {
        /**If the client is still connected, then he will be disconnected,
         * otherwise (if the connection was disconnected) then it will log the error.
         */
        if (this.webSocket.readyState === WebSocket.OPEN) {
            alert("Try again,press F5");
            /**Closes connection, and also deletes the player's data*/
            this.webSocket.close();
            ballPlayers.delete(id)

        } else {
            console.error('webSocket is not open. readyState=' + this.webSocket.readyState);
        }
    }

    /**Gets the current status of webSocket*/
    getStatus() {
        return this.webSocket.readyState;
    }

    /**Sends the message to server.
     *
     *@param message message to send.
     */
    send(message) {
        /**It can send the message only if connection between server and client
         * is open, otherwise it will log the error and alert the player which is
         * a connection problem (possibly disconnected from server).
         */
        if (this.webSocket.readyState === WebSocket.OPEN) {
            /**sending the message itself*/
            this.webSocket.send(message);

        } else {
            /**Logs and alerts user*/
            console.error('webSocket is not open. readyState=' + this.webSocket.readyState);
            alert("Connection error,retry!");
        }
    }
}