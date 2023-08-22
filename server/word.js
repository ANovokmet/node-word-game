
const fs = require('fs');
const path = require('path');
const { random, randomMany, shuffle } = require('./utils');

const wordsData = require('../data/words.json');
let wordTypes = wordsData.map(w => w.type);
let parsed = {};
for (const { type, count } of wordsData) {
    const lines = fs.readFileSync(path.join(__dirname,`../data/words-${type}.txt`)).toString().split('\n');
    parsed[type] = lines.filter(l => l);
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

const syllables = require('../data/syllables-hr.json');

const naughty = ['pr', 'rve', 'rva', 'ri', 'ru', 'di', 'de', 'go', 'vno', 'zda', 'čka', 'čki', 'bu', 'je', 'be', 'bi', 'bo', 'te', 'šu', 'pa', 'k', 'pe', 'ni', 's', 'va', 'gi', 'si', 'se', 'ci', 'ce', 'dr', 'k', 'ks', 'gu', 'zi', 'za', 'ca', 'cu']

function getSyllables() {
    const result = [
        ...randomMany(syllables.slice(0, 50), 10).map(([syl, _]) => syl),
        ...randomMany(syllables.slice(0, 100), 10).map(([syl, _]) => syl),
        ...randomMany(syllables.slice(0, 800), 8).map(([syl, _]) => syl),
        ...randomMany(naughty, 8),
        random(random(parsed[random(['glagol','imenica','prijedlog', 'pridjevska zamjenica'])]).split(','))
    ];
    return shuffle(result);
}

module.exports = {
    getWords,
    getSyllables
};