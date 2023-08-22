
function randomOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomMany(arr, n) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, n);
    return selected;
}

function shuffle(arr) {
    return arr.slice().sort(() => 0.5 - Math.random());
}

module.exports = {
    random: randomOne,
    randomOne,
    randomMany,
    shuffle
};
