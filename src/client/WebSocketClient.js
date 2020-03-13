/**A Websocket client class what implements WebSocket in JS.
 * WebSockets provide a bidirectional, full-duplex communications channel
 * that operates over HTTP through a single TCP/IP socket connection.
 * At default it sets on ws://127.0.0.1/8080/Agar1_war_exploded/endpoint.
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
     * @param port the port on which will be deployed connection.
     * @param endpoint the name of the endpoint (value on the server side).
     */
    constructor(protocol, hostname, port, endpoint) {
        this.webSocket = null;
        this.protocol = protocol;
        this.hostname = hostname;
        this.port = port;
        this.endpoint = endpoint;
    }

    /**return server url on which is deployed */
    getServerUrl() {
        return this.protocol + "://" + this.hostname + ":" + this.port + this.endpoint;
    }

    /**Connect the websocket to the server (through getServerUrl()).
     * It also override the basics function on webSocket
     * onopen, onmessage, onclose, onerror.
     */
    connect() {
        /**Connection to the server can throw IOException if
         * the server is closed or the connection is not available.
         */
        try {
            /**Create new websocket from the given server URL.*/
            this.webSocket = new WebSocket(this.getServerUrl());

            /**Override the method onopen from webSocket,
             * The method is invoked when it's opening connection
             * between client and server.
             *
             * @param event current event.
             */
            this.webSocket.onopen = function (event) {
                /**Log the opening connection*/
                console.log('onopen::' + JSON.stringify(event, null, 4));
            };

            /**Override the method onmessage from webSocket,
             * The method is invoked when client receive
             * a message from server.
             *
             * @param event the event message.
             */
            this.webSocket.onmessage = function (event) {
                /**extract message information from event*/
                let msg = event.data;

                /**Handle the situation when message is about
                 * the received id from the server.
                 * It store the id in the field id.
                 * Message have form: "id:id_number".
                 */
                if (msg.includes("id:")) {
                    /**Store the id generated from server*/
                    id = msg.substring(3);

                    /**Log the receiving ID*/
                    console.log("Received ID:"+id);

                }

                /**Handle the situation when message is about
                 * "simply" ball,at start of the connection Server send
                 * n "simply" ball to the client,and when client eat some
                 * of the "simply" ball,server send to client new coordinates
                 * of a "i(toSearch)" simply ball
                 */
                else if (msg.includes("balls:")){
                    /**Message has form "balls:id_of_simply_ball;X_coord;Y_coord",
                     * toSearch parse useful information about ball.
                     * @type {string}
                     */
                    let toSearch = msg.substring(6);

                    /**Split useful information into:
                     * res[0] = id of a "simply" ball.
                     * res[1] = X coordinate of the center of a "simply" ball.
                     * res[2] = Y coordinate of the center of a "simply" ball.
                     * @type {string[]}
                     */
                    let res = toSearch.split(";");

                    /**Put to Map of "simply" ball information about new ball (res[0]).
                     * A simply bal have radius RAD_BALL_TO_EAT,which is constant.
                     * */
                    ballToEat.set(res[0], new Ball(res[1],res[2],RAD_BALL_TO_EAT));
                }

                /**Handle the situation when message is about
                 * information about some player from Server.
                 * Message have form:
                 * "ballP:id;X_coordinate;Y_coordinate;radius"
                 */
                else if (msg.includes("ballP:")){
                    /**toSearch parse useful information about ball
                     *
                     * @type {string}
                     */
                    let toSearch = msg.substring(6);

                    /**Split the useful information into:
                     * res[0] = ID of a player's ball.
                     * res[1] = X coordinate of the center of a player's ball,
                     * res[2] = Y coordinate of the center of a player's ball.
                     * res[3] = Radius of the player's ball.
                     * @type {string[]}
                     */
                    let res = toSearch.split(";");

                    /**Put into Map the player's ball.
                     * It is used to update locations of player from server.
                     */
                    ballPlayers.set(res[0], new Ball(res[1], res[2], res[3]));
                }

                /**Handle the situation when current player
                 * was eaten by another,bigger player.
                 */
                else if (msg.includes("alert")){
                    /**Log what player was eaten(by alert).*/
                    console.log("Message alert:" + JSON.stringify(msg,null,4));
                    //TODO Normal exit on the client side of the eaten player.
                    /**Alert player*/
                    alert("You were eaten!");

                    /**p5.js function that stops drawing loop and remove canvas.*/
                    remove();
                }

                /**Handle the situation when a player has left the game.*/
                else if (msg.includes("close:")){
                    /**Delete player (by playerID) from Map with all players.*/
                    ballPlayers.delete(msg.substring(6));

                    /**Log the deleted player.*/
                    console.log(msg.substring(6));
                }

                /**Handle the situation when message
                 * was of different form,what was expected.
                 */
                else {
                    console.log("Message has different form of expected,message="+msg);
                }
            };

            /**Override the method onclose from webSocket,
             * The method is invoked when client or server
             * is closing the connection.
             *
             * @param event the message.
             */
            this.webSocket.onclose = function (event) {
                /**Log the closing state*/
                console.log('onclose::' + JSON.stringify(event, null, 4));

                /**Delete player's data */
                ballPlayers.delete(id);
            };
            /**Override the method onerror from webSocket,
             * The method is invoked when error is thrown
             * on server, or client side.
             *
             * @param event the message.
             */
            this.webSocket.onerror = function (event) {
                /**Log the error*/
                console.log('onerror::' + JSON.stringify(event, null, 4));
            }

        }

        /**Connection to the server can throw IOException if
         * the server is closed or the connection is not available.
         */
        catch (exception) {
            console.error(exception);
        }
    }

    /**Disconect from the server.*/
    disconnect() {
        /**If client is still connected,when it will be disconnected,
         * otherwise (if connection was disconnected) it will log the error.
         */
        if (this.webSocket.readyState === WebSocket.OPEN) {
            alert("Try again,press F5");
            /**Close connection,and also delete player's data*/
            this.webSocket.close();
            ballPlayers.delete(id)

        } else {
            console.error('webSocket is not open. readyState=' + this.webSocket.readyState);
        }
    }

    /**Get the current status of webSocket*/
    getStatus() {
        return this.webSocket.readyState;
    }

    /**Send the message to server.
     *
     *@param message message to send.
     */
    send(message) {
        /**It can send message only if connection between server and client
         * is open, otherwise it will log the error,and alert player what is
         * a connection problem (possibly disconnected from server).
         */
        if (this.webSocket.readyState === WebSocket.OPEN) {
            /**sending the message itself*/
            this.webSocket.send(message);

        } else {
            /**Log and alert user*/
            console.error('webSocket is not open. readyState=' + this.webSocket.readyState);
            alert("Connection error,retry!");
        }
    }
}