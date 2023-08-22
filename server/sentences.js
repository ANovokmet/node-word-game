const { random } = require('./utils');

function getFromWeb() {
    const result = [];
    document.querySelectorAll('.title').forEach(e => result.push(e.innerText));
    return result;
}

//const sentences = require('../data/starters-12-08-20.json');
const sentences = [
    'Zašto _ napreduju tako brzo?',
    'Zašto talibani _ tako brzo?',
    'U restoranu ću naručiti: _',
    'Prvo na što ujutro pomislim: _',
    '_, to me čini sretnim'
];

function getSentence() {
    return random(sentences);
}

module.exports = {
    getSentence
}