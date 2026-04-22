let seq = [];
let user = [];
let level = 0;
let canClick = false;
let best = Number(localStorage.best) || 0;

function start(){
  seq = [];
  level = 0;
  next();
}

function next(){
  user = [];
  level++;
  canClick = false;

  document.getElementById("info").innerText =
    "Level " + level + " | Best " + best;

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

    document.getElementById("info").innerText =
      steps[i] + " | Level " + level + " | Best " + best;

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
    document.getElementById("info").innerText =
      "Game Over! Level " + (level - 1);

    if(level > best){
      best = level;
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