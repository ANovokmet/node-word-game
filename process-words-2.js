const fs = require('fs');
const path = require('path')
const wordsData = require('./data/words.json');
const wordTypes = wordsData.map(w => w.type);
const parsed = {};
const all = {};
for (const { type, count } of wordsData) {
    const lines = fs.readFileSync(path.join(__dirname,`./data/words-${type}.txt`)).toString().split('\n');
    parsed[type] = lines.filter(l => l).map(toRoot);

    parsed[type]

    for (const line of parsed[type]) {
        if(!/^([a-pr-vzA-PR-VZčćžšđČĆŽŠĐ]+)$/.test(line)) {
            continue;
        }
        const syllables = line.split(/(?<=[aeiourAEIOUR])/g);
        for (let syl of syllables) {
            syl = syl.toLowerCase();
            if(!all[syl]) {
                all[syl] = 0;
            }
            all[syl]++;
        }
    }
}

// xywäüöőé0-9\-\&\.

const result = Object.entries(all).sort((a,b) => b[1] - a[1]);

fs.writeFileSync(path.join(__dirname,`./data/syllables-hr.json`), JSON.stringify(result));

console.log(result);
console.log(randomN(result.filter(a => a[1] > 20),20).map(a => a[0]))
console.log(randomN(result.filter(a => a[1] > 1000),20).map(a => a[0]))

function randomN(arr, n) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, n);
    return selected;
}


console.log(randomN(parsed['prilog'],2))
console.log(randomN(parsed['glagol'],2))

function toRoot(w) {
    return w.split(',')[0];
}

console.log(randomN(parsed['pridjev'],2))
console.log(randomN(parsed['imenica'],2))