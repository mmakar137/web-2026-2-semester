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
    return Array.from({length: 12}, (_, i) => i + 1);
}

function render() {
    playersContainer.innerHTML = players.map((p, i) => 
        `<div class="player-card" style="${!rolled && currentPlayer === i ? 'border:2px solid black' : ''}">
            <div class="player-name">Игрок ${i+1}</div>
            <div class="numbers">${p.map(n => `<span class="number">${n}</span>`).join('')}${p.length ? '' : 'ПОБЕДА!'}</div>
        </div>`
    ).join('');
}

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    rolled = false;
    optionsDiv.innerHTML = '';
    rollBtn.disabled = false;
    turnIndicator.innerText = 'Ход игрока ' + (currentPlayer + 1);
    render();
    players.some((p, i) => p.length === 0 && (turnIndicator.innerText = 'Игрок ' + (i+1) + ' ПОБЕДИЛ!', rollBtn.disabled = true));
}

function makeMove(opt, player) {
    if (opt.includes('+')) {
        opt.split('+').map(Number).forEach(n => {
            let idx = player.indexOf(n);
            if (idx !== -1) player.splice(idx, 1);
        });
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
    opts.map(opt => {
        let btn = document.createElement('button');
        btn.innerText = 'Убрать ' + opt;
        btn.className = 'option-btn';
        btn.onclick = () => makeMove(opt, players[currentPlayer]);
        optionsDiv.appendChild(btn);
    });
    rollBtn.disabled = true;
    turnIndicator.innerText = 'Ход игрока ' + (currentPlayer+1) + ' - выберите';
    render();
}

function startGame() {
    let count = Math.min(6, Math.max(2, parseInt(playerCountInput.value) || 2));
    players = Array.from({length: count}, () => newNumbers());
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
resetBtn.onclick = () => {
    if (setupDiv.style.display === 'none') {
        players = Array.from({length: players.length}, () => newNumbers());
        currentPlayer = 0;
        rolled = false;
        render();
        turnIndicator.innerText = 'Ход игрока 1';
        rollBtn.disabled = false;
        optionsDiv.innerHTML = '';
    }
};
rollBtn.onclick = rollDice; 
