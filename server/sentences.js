function getFromWeb() {
    const result = [];
    document.querySelectorAll('.title').forEach(e => result.push(e.innerText));
    return result;
}

const sentences = require('../data/starters-12-08-20.json');

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getSentence() {
    return random(sentences);
}

module.exports = {
    getSentence
}