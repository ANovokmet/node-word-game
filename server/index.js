const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
server.listen(3000, () => {
    console.log('running on localhost:3000');
});
const io = socketio(server);

const {
    onResetGame,
    onDisconnect,
    onSubmitSentence,
    onUpdateSettings,
    onConnection
} = require('./handlers')(io);

io.on('connection', socket => {
    onConnection.call(socket);
    socket.on('disconnect', onDisconnect);
    socket.on('submit_sentence', onSubmitSentence);
    socket.on('update_settings', onUpdateSettings);
    socket.on('reset_game', onResetGame);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});