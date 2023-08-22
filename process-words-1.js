const fs = require('fs');
const path = require('path');

const text = fs.readFileSync('./data/HR_Txt-624.txt', 'utf8').toString();

console.log(text.split('\n')[123].split('\t'));
// 0: riječ, 1: korijen, 2: '' ili broj 3: tip riječi

const output = {};
const lines = text.split('\n');
console.log('lines:', lines.length);
for (const line of lines) {
    const [word, root, _, type] = line.replace(/\r/g, '').split('\t');
    if (!output[type]) {
        //output[type] = [];
        output[type] = {};
    }
    if (!output[type][root]) {
        output[type][root] = [];
    }
    output[type][root].push(word);
    //output[type].push([word, root]);
}

console.log('files: ', Object.keys(output).length)
for (const type in output) {
    console.log(`${type}: ${output[type].length}`)

    let text = '';
    for (const root in output[type]) {
        text += `${root},${output[type][root].join(',')}\n`
    }

    // const text = output[type].map(l => l[0] + ',' + l[1]).join('\n')

    fs.writeFileSync(`./data/words-${type}.txt`, text, 'utf8');
    console.log(`wrote ${type}`);
}

const data = [];
for (const type in output) {
    data.push({
        type,
        count: Object.keys(output[type]).length
    });
}

fs.writeFileSync(`./data/words.json`, JSON.stringify(data));