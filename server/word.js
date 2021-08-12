
const fs = require('fs');
const path = require('path');

const wordsData = require('../data/words.json');
const wordTypes = wordsData.map(w => w.type);
const parsed = {};
for (const { type, count } of wordsData) {
    const lines = fs.readFileSync(path.join(__dirname,`../data/words-${type}.txt`)).toString().split('\n');
    parsed[type] = lines.filter(l => l);
}

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getWords() {
    const result = [];
    for (let i = 0; i < 3; i++) {
        const type = random(wordTypes);
        const word = random(parsed[type]);
        const words = word.split(',');
        result.push(words);
    }
    return result;
}

module.exports = {
    getWords
};