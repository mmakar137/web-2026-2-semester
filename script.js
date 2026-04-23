let seq = [];
let user = [];
let level = 0;
let canClick = false;
let best = Number(localStorage.best) || 0;

let info = document.getElementById("info");
let startBtn = document.getElementById("startBtn");

// кнопка старта
startBtn.addEventListener("click", start);

// кнопки игры
document.getElementById("b0").addEventListener("click", function(){ clickBtn(0); });
document.getElementById("b1").addEventListener("click", function(){ clickBtn(1); });
document.getElementById("b2").addEventListener("click", function(){ clickBtn(2); });
document.getElementById("b3").addEventListener("click", function(){ clickBtn(3); });

function start(){
  seq = [];
  level = 0;
  next();
}

function next(){
  user = [];
  level++;
  canClick = false;

  seq.push(Math.floor(Math.random()*4));
  countdown();
}

function countdown(){
  let steps = ["Ready", "3", "2", "1", "Go"];
  let i = 0;

  function step(){
    if(i >= steps.length){
      show();
      return;
    }

    info.innerText = steps[i] + " | Best " + best;

    i++;
    setTimeout(step, 500);
  }

  step();
}

function show(){
  let i = 0;

  function step(){
    if(i >= seq.length){
      canClick = true;
      info.innerText = "Your turn | Level " + level + " | Best " + best;
      return;
    }

    let b = document.getElementById("b" + seq[i]);
    b.classList.add("active");

    setTimeout(function(){
      b.classList.remove("active");
      i++;
      setTimeout(step, 300);
    }, 500);
  }

  setTimeout(step, 300);
}

function clickBtn(n){
  if(!canClick) return;

  user.push(n);
  let i = user.length - 1;

  if(user[i] !== seq[i]){
    let score = level - 1;

    info.innerText = "Game Over! Score " + score + " | Best " + best;

    if(score > best){
      best = score;
      localStorage.best = best;
    }

    canClick = false;
    return;
  }

  if(user.length === seq.length){
    canClick = false;
    setTimeout(next, 700);
  }
}
