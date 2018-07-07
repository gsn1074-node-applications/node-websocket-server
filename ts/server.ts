import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from 'net';

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

const httpServer = http.createServer(express());
const webSocketServer = new WebSocket.Server({server: httpServer});

webSocketServer.on('connection', (socket: ExtWebSocket, request: http.IncomingMessage) => {

    console.log("socket.url: " + socket.url);
    console.log("request.connection.remoteAddress: " + request.connection.remoteAddress);

    socket.isAlive = true;

    socket.on('close', (socket: WebSocket) => {
        console.log("connection closed");
    });

    socket.on('pong', () => {
        console.log("received pong");
        socket.isAlive = true;
    });

    socket.on('message', (message: string) => {

        console.log('received: %s', message);

        const broadcastRegex = /^broadcast\:/;

        if (broadcastRegex.test(message)) {

            message = message.replace(broadcastRegex, '');

            webSocketServer.clients.forEach(client => {
                if (client != socket) {
                    client.send(`Hello, broadcast message -> ${message}`);
                }    
            });
            
        } else {
            socket.send(`Hello, you sent -> ${message}`);
        }
    });
});

setInterval(() => {

    webSocketServer.clients.forEach((socket: ExtWebSocket | WebSocket) => {
        
        if (!(<ExtWebSocket>socket).isAlive) {
            console.log("terminated connection");
            return socket.terminate();
        }

        (<ExtWebSocket>socket).isAlive = false;
        socket.ping(() => {});
    });
}, 10000);

httpServer.listen(process.env.PORT || 3001, () => {
    console.log(`Server started on port ${(<AddressInfo>httpServer.address()).port} :)`);
});
