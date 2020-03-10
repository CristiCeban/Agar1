class WebSocketClient {
//TODO make good generation of the ball.
    constructor(protocol, hostname, port, endpoint) {
        this.webSocket = null;
        this.protocol = protocol;
        this.hostname = hostname;
        this.port = port;
        this.endpoint = endpoint;
    }

    getServerUrl() {
        return this.protocol + "://" + this.hostname + ":" + this.port + this.endpoint;
    }

    connect() {
        try {
            this.webSocket = new WebSocket(this.getServerUrl());

            this.webSocket.onopen = function (event) {
                console.log('onopen::' + JSON.stringify(event, null, 4));
            };

            this.webSocket.onmessage = function (event) {
                var msg = event.data;
                //console.log('onmessage::' + JSON.stringify(msg, null, 4));
                if (msg.includes("id:")) {
                    id = msg.substring(3);
                    console.log("IDReceived"+id);
                } else if (msg.includes("balls:")){
                    let toSearch = msg.substring(6);
                    let res = toSearch.split(";");
                    ballToEat.set(res[0], new Ball(res[1],res[2],RAD_BALL_TO_EAT));
                }
                else if (msg.includes("ballP:")){
                    let toSearch = msg.substring(6);
                    let res = toSearch.split(";");
                    ballPlayers.set(res[0], new Ball(res[1], res[2], res[3]));
                }
                else if (msg.includes("alert")){
                    console.log("Message alert:" + JSON.stringify(msg,null,4));
                    alert("You were eaten!");
                    noLoop();
                }
                else if (msg.includes("close:")){
                    ballPlayers.delete(msg.substring(6));
                    //console.log(msg.substring(6));
                }
            };

            this.webSocket.onclose = function (event) {
                console.log('onclose::' + JSON.stringify(event, null, 4));
                ballPlayers.delete(id);
            };

            this.webSocket.onerror = function (event) {
                console.log('onerror::' + JSON.stringify(event, null, 4));
            }

        } catch (exception) {
            console.error(exception);
        }
    }

    disconnect() {
        if (this.webSocket.readyState === WebSocket.OPEN) {
            alert("Try again,press F5");
            this.webSocket.close();
            ballPlayers.delete(id)

        } else {
            console.error('webSocket is not open. readyState=' + this.webSocket.readyState);
        }
    }

    getStatus() {
        return this.webSocket.readyState;
    }

    send(message) {

        if (this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(message);

        } else {
            console.error('webSocket is not open. readyState=' + this.webSocket.readyState);
            alert("Connection error,retry!");
        }
    }


}

