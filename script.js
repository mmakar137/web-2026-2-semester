let secretNumber = '';
let attempts = 0;

function generateSecretNumber() {
    const digits = [];
    while (digits.length < 4) {
        const digit = Math.floor(Math.random() * 10);
        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }
    return digits.join('');
}

function evaluateGuess(guess) {
    let bulls = 0;
    let cows = 0;
    const secretDigits = secretNumber.split('');
    const guessDigits = guess.split('');

    for (let i = 0; i < 4; i++) {
        if (guessDigits[i] === secretDigits[i]) {
            bulls++;
            secretDigits[i] = null;
            guessDigits[i] = null;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (guessDigits[i] !== null) {
            const indexInSecret = secretDigits.indexOf(guessDigits[i]);
            if (indexInSecret !== -1) {
                cows++;
                secretDigits[indexInSecret] = null;
            }
        }
    }

    return { bulls, cows };
}

function makeGuess() {
    const guessInput = document.getElementById('guessInput');
    const guess = guessInput.value;
    const output = document.getElementById('output');

    if (guess.length !== 4 || !/^\d+$/.test(guess)) {
        output.innerHTML += "Invalid guess. Please enter a 4-digit number.\n";
        guessInput.value = '';
        return;
    }

    attempts++;
    const { bulls, cows } = evaluateGuess(guess);

    output.innerHTML += `Attempt ${attempts}: Guess = ${guess}, Bulls = ${bulls}, Cows = ${cows}\n`;

    if (bulls === 4) {
        output.innerHTML += `Congratulations! You guessed the number ${secretNumber} in ${attempts} attempts.\n`;
        return;
    }

    guessInput.value = '';
}

function newGame() {
    secretNumber = generateSecretNumber();
    attempts = 0;
    const output = document.getElementById('output');
    output.innerHTML = "Enter your 4-digit guess (e.g., 0123):\n";
    document.getElementById('guessInput').value = '';
    console.log('Загадано:', secretNumber);
}

secretNumber = generateSecretNumber();
document.getElementById('output').innerHTML = "Enter your 4-digit guess (e.g., 0123):\n";
console.log('Загадано:', secretNumber);