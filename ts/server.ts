import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from 'net';

const httpServer = http.createServer(express());
const webSocketServer = new WebSocket.Server({server: httpServer});

webSocketServer.on('connection', (socket: WebSocket) => {

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

httpServer.listen(process.env.PORT || 3001, () => {

    console.log(`Server started on port ${(<AddressInfo>httpServer.address()).port} :)`);
});
