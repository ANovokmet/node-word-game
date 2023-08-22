const { getWords, getSyllables } = require('./word');
const { getSentence } = require('./sentences');

const connections = {};
const state = {
    currentId: null,
    connectionIds: null,
    turn: 0
};

function sockets() {
    return Object.values(connections);
}

function getScore(sentence, words) {
    sentence = sentence.toLowerCase();
    let score = sentence.length;
    for (const word of words) {
        for(const inflection of word) {
            if(sentence.includes(inflection.toLowerCase())) {
                score += 5 + inflection.length * 3;
                break;
            }
        }
    }
    return score;
}

function markupSentence(sentence = '', words) {
    for (const word of words) {
        for(const inflection of word) {
            const regex = new RegExp(escape(inflection), 'ig');
            sentence = sentence.replace(regex, `<span class="bonus">${inflection}</span>`)
        }
    }
    return sentence;
}

function escape(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function currentUsers() {
    const result = [];
    for (const userId in connections) {
        const connection = connections[userId];
        result.push({
            userId: connection.id,
            username: connection.username || 'Anonymous',
            score: connection.score || 0
        });
    }
    return result;
}

module.exports = (io) => {
    function onConnection() {
        const socket = this;
        
        console.log('connected', socket.id);

        connections[socket.id] = socket;

        socket.emit('users', currentUsers());
        socket.broadcast.emit('user_connected', {
            userId: socket.id,
            username: socket.username,
            score: socket.score
        });

        if (Object.keys(connections).length >= 2) {
            startGame();
        }
    }

    function onDisconnect(reason) {
        const socket = this;

        delete connections[socket.id];
        
        io.emit('user_disconnected', {
            userId: socket.id,
            username: socket.username,
            score: socket.score
        });
        if (Object.keys(connections).length < 2) {
            io.emit('stop_game');
        }
    }

    function onSubmitSentence([syls,locked]) {
        const socket = this;

        socket.syls = syls;
        socket.submitted = locked;

        if(sockets().every(s => s.submitted)) {
            endTurn();
        }
    }

    function onResetGame() {
        startGame();
    }

    function onUpdateSettings(data) {
        const socket = this;

        if (data.username) {
            socket.username = data.username;
            io.emit('username_change', { userId: socket.id, username: socket.username });
        }
    }

    function startGame() {
        const scores = {};
        for (const connectionId in connections) {
            const connection = connections[connectionId];
            connection.score = 0;
            scores[connectionId] = 0;
        }

        state.turn = 0;
        io.emit('start_game', {
            story: [getSentence()],
            scores
        });
        startTurn();
    }

    let countdown;
    function wait(fn, timeout) {
        if(countdown) {
            clearInterval(countdown);
        }
        countdown = setInterval(() => {
            timeout = timeout - 1000;
            io.emit('time', timeout / 1000);
            if(timeout <= 0) {
                clearInterval(countdown);
                fn();
            }
        }, 1000);
    }
    function startTurn() {
        const sentence = getSentence();
        for (const socket of sockets()) {
            socket.syls = [];
            socket.submitted = null;
            socket.emit('start_turn', {
                sentence,
                syls: getSyllables(),
            });
        }
        wait(() => endTurn(), 90 * 1000);
    }

    function endTurn() {
        const syls = Object.values(connections).map(socket => [socket.id, socket.syls]);
        io.emit('end_turn', {
            // user sentences
            syls
        })
        wait(() => startTurn(), 10 * 1000);
    }

    return {
        onResetGame,
        onDisconnect,
        onSubmitSentence,
        onUpdateSettings,
        onConnection
    }
}