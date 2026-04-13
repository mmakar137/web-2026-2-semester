let players, currentPlayer, rolled, d1, d2;

const setupDiv = document.getElementById('setup');
const gameArea = document.getElementById('gameArea');
const playerCountInput = document.getElementById('playerCount');
const startBtn = document.getElementById('startBtn');
const rollBtn = document.getElementById('rollBtn');
const resetBtn = document.getElementById('resetBtn');
const dice1El = document.getElementById('dice1');
const dice2El = document.getElementById('dice2');
const turnIndicator = document.getElementById('turnIndicator');
const optionsDiv = document.getElementById('options');
const playersContainer = document.getElementById('playersContainer');

function newNumbers() {
    let arr = [];
    for (let i = 1; i <= 12; i++) arr.push(i);
    return arr;
}

function render() {
    playersContainer.innerHTML = '';
    for (let i = 0; i < players.length; i++) {
        let p = players[i];
        let card = document.createElement('div');
        card.className = 'player-card';
        if (!rolled && currentPlayer === i) card.style.border = '2px solid black';
        card.innerHTML = '<div class="player-name">Игрок ' + (i+1) + '</div><div class="numbers">';
        for (let n of p) card.innerHTML += '<span class="number">' + n + '</span>';
        card.innerHTML += p.length ? '' : 'ПОБЕДА!';
        card.innerHTML += '</div>';
        playersContainer.appendChild(card);
    }
}

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    rolled = false;
    optionsDiv.innerHTML = '';
    rollBtn.disabled = false;
    turnIndicator.innerText = 'Ход игрока ' + (currentPlayer + 1);
    render();
    for (let i = 0; i < players.length; i++) {
        if (players[i].length === 0) {
            turnIndicator.innerText = 'Игрок ' + (i+1) + ' ПОБЕДИЛ!';
            rollBtn.disabled = true;
        }
    }
}

function makeMove(opt, player) {
    if (opt.includes('+')) {
        let [a, b] = opt.split('+').map(Number);
        player.splice(player.indexOf(a), 1);
        player.splice(player.indexOf(b), 1);
    } else {
        player.splice(player.indexOf(Number(opt)), 1);
    }
    render();
    if (player.length === 0) {
        turnIndicator.innerText = 'Игрок ' + (currentPlayer+1) + ' ПОБЕДИЛ!';
        rollBtn.disabled = true;
        optionsDiv.innerHTML = '';
        return;
    }
    nextTurn();
}

function rollDice() {
    if (rolled) { turnIndicator.innerText = 'Уже бросали!'; return; }
    d1 = Math.floor(Math.random() * 6) + 1;
    d2 = Math.floor(Math.random() * 6) + 1;
    const map = {1:'⚀',2:'⚁',3:'⚂',4:'⚃',5:'⚄',6:'⚅'};
    dice1El.innerText = map[d1];
    dice2El.innerText = map[d2];
    let p = players[currentPlayer];
    let sum = d1 + d2;
    let opts = [];
    if (p.includes(d1)) opts.push('' + d1);
    if (p.includes(d2)) opts.push('' + d2);
    if (p.includes(sum)) opts.push('' + sum);
    if (p.includes(d1) && p.includes(d2) && d1 !== d2) opts.push(d1 + '+' + d2);
    if (opts.length === 0) {
        turnIndicator.innerText = 'Нет ходов -> переход';
        setTimeout(nextTurn, 800);
        return;
    }
    rolled = true;
    optionsDiv.innerHTML = '';
    for (let opt of opts) {
        let btn = document.createElement('button');
        btn.innerText = 'Убрать ' + opt;
        btn.className = 'option-btn';
        btn.onclick = (function(o) { return function() { makeMove(o, players[currentPlayer]); }; })(opt);
        optionsDiv.appendChild(btn);
    }
    rollBtn.disabled = true;
    turnIndicator.innerText = 'Ход игрока ' + (currentPlayer+1) + ' - выберите';
    render();
}

function startGame() {
    let count = parseInt(playerCountInput.value);
    if (count < 2) count = 2;
    if (count > 6) count = 6;
    players = [];
    for (let i = 0; i < count; i++) players.push(newNumbers());
    currentPlayer = 0;
    rolled = false;
    setupDiv.style.display = 'none';
    gameArea.style.display = 'block';
    render();
    turnIndicator.innerText = 'Ход игрока 1';
    rollBtn.disabled = false;
    optionsDiv.innerHTML = '';
}

startBtn.onclick = startGame;
resetBtn.onclick = function() {
    if (setupDiv.style.display === 'none') {
        let count = players.length;
        players = [];
        for (let i = 0; i < count; i++) players.push(newNumbers());
        currentPlayer = 0;
        rolled = false;
        render();
        turnIndicator.innerText = 'Ход игрока 1';
        rollBtn.disabled = false;
        optionsDiv.innerHTML = '';
    }
};
rollBtn.onclick = rollDice;