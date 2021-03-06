"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const httpServer = http.createServer(express());
const webSocketServer = new WebSocket.Server({ server: httpServer });
webSocketServer.on('connection', (socket, request) => {
    console.log("socket.url: " + socket.url);
    console.log("request.connection.remoteAddress: " + request.connection.remoteAddress);
    socket.isAlive = true;
    socket.on('close', (socket) => {
        console.log("connection closed");
    });
    socket.on('pong', () => {
        console.log("received pong");
        socket.isAlive = true;
    });
    socket.on('message', (message) => {
        console.log('received: %s', message);
        const broadcastRegex = /^broadcast\:/;
        if (broadcastRegex.test(message)) {
            message = message.replace(broadcastRegex, '');
            webSocketServer.clients.forEach(client => {
                if (client != socket) {
                    client.send(`Hello, broadcast message -> ${message}`);
                }
            });
        }
        else {
            socket.send(`Hello, you sent -> ${message}`);
        }
    });
});
setInterval(() => {
    webSocketServer.clients.forEach((socket) => {
        if (!socket.isAlive) {
            console.log("terminated connection");
            return socket.terminate();
        }
        socket.isAlive = false;
        socket.ping(() => { });
    });
}, 10000);
httpServer.listen(process.env.PORT || 3001, () => {
    console.log(`Server started on port ${httpServer.address().port} :)`);
});
//# sourceMappingURL=server.js.map