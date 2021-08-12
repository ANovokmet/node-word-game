const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
server.listen(3000);
const io = socketio(server);

const { getWords } = require('./word');
const { getSentence } = require('./sentences');


const connections = {};
const state = {
    currentId: null,
    connectionIds: null,
    turn: 0
}
io.on('connection', socket => {
    console.log('connected', socket);

    connections[socket.id] = socket;

    socket.emit('users', Object.keys(connections).map(userId => {
        const connection = connections[userId];
        return {
            userId: connection.id,
            username: connection.username || 'Anonymous',
            score: connection.score || 0
        };
    }));
    socket.broadcast.emit('user_connected', { 
        userId: socket.id,
        username: socket.username,
        score: socket.score
    });
    socket.on('disconnect', (reason) => {
        io.emit('user_disconnected', { 
            userId: socket.id,
            username: socket.username
        })
        delete connections[socket.id];
        if(Object.keys(connections).length < 2) {
            io.emit('stop_game');
        }
    });

    function startGame() {
        state.connectionIds = Object.keys(connections);
        const scores = {};
        for (const connectionId in connections) {
            const connection = connections[connectionId];
            connection.score = 0;
            scores[connectionId] = 0;
        }

        state.turn = 1;
        io.emit('start_game', {
            story: [getSentence()],
            scores
        });

        state.currentId = state.connectionIds[state.turn % state.connectionIds.length];
        io.emit('stop_sentence');

        const otherSocket = connections[state.currentId];
        otherSocket.words = getWords();
        otherSocket.emit('start_sentence', {
            words: otherSocket.words
        });
    }

    if(Object.keys(connections).length == 2) {
        startGame();
    }

    function getScore(sentence, words) {
        return sentence.length;
    }

    socket.on('submit_sentence', sentence => {
        socket.score += getScore(sentence, socket.words);
        io.emit('score_update', {
            [socket.id]: socket.score
        });

        state.turn++;
        socket.broadcast.emit('new_sentence', sentence);


        state.currentId = state.connectionIds[state.turn % state.connectionIds.length];
        socket.emit('stop_sentence');

        const otherSocket = connections[state.currentId];
        otherSocket.words = getWords();
        otherSocket.emit('start_sentence', {
            words: otherSocket.words
        });
    })

    socket.on('reset_game', () => {
        startGame();
    });

    socket.on('update_settings', data => {
        if(data.username) {
            socket.username = data.username;
            io.emit('username_change', { userId: socket.id, username: socket.username  });
        }
    })
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
console.log('running on localhost:3000');