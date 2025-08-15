// Friendsy Data Words — Learn Data Basics (PWA)
// No external assets. Background music generated via WebAudioAPI.

const DATA_TERMS = [
  { term: "DATASET", def: "A collection of related data, often in a table or file.", hint: "You train models on this." },
  { term: "TABLE", def: "A grid of rows and columns storing data.", hint: "Spreadsheet core." },
  { term: "ROW", def: "A single record or observation.", hint: "Horizontal." },
  { term: "COLUMN", def: "A set of values for a single attribute.", hint: "Vertical." },
  { term: "SCHEMA", def: "The structure/blueprint describing fields and types.", hint: "Database blueprint." },
  { term: "PRIMARYKEY", def: "A unique identifier for a row.", hint: "No duplicates allowed." },
  { term: "SQL", def: "Language to query and manage relational data.", hint: "SELECT * FROM ..." },
  { term: "JOIN", def: "Combine rows from two tables using a related column.", hint: "Inner, left, right, full." },
  { term: "GROUPBY", def: "Aggregate data by categories.", hint: "Often used with COUNT/SUM." },
  { term: "NULL", def: "Represents missing or unknown value.", hint: "Not zero or empty string." },
  { term: "CSV", def: "Plain-text format with comma-separated values.", hint: "Simple file format." },
  { term: "JSON", def: "Text format for structured data using key–value pairs and arrays.", hint: "Web APIs love it." },
  { term: "API", def: "Interface to let software applications communicate.", hint: "Endpoints and requests." },
  { term: "FEATURE", def: "An input variable used by a model.", hint: "Independent variable." },
  { term: "LABEL", def: "The target variable a model predicts.", hint: "Dependent variable." },
  { term: "SPLIT", def: "Dividing data into train/validation/test sets.", hint: "Commonly 80/20." },
  { term: "OVERFITTING", def: "Model memorizes training data and fails to generalize.", hint: "High variance problem." },
  { term: "BIAS", def: "Systematic error that skews results.", hint: "Opposite of variance." },
  { term: "VARIANCE", def: "How much predictions change with different data.", hint: "Opposite of bias." },
  { term: "MEAN", def: "Average value.", hint: "Sum divided by count." },
  { term: "MEDIAN", def: "Middle value when sorted.", hint: "Robust to outliers." },
  { term: "MODE", def: "Most common value.", hint: "Categorical favorite." },
  { term: "HISTOGRAM", def: "Chart that shows distribution of a numeric variable.", hint: "Bins." },
  { term: "SCATTERPLOT", def: "Chart that displays relationship between two variables.", hint: "Dots everywhere." },
  { term: "CORRELATION", def: "Measures linear relationship strength.", hint: "Pearson's r." },
  { term: "NORMALIZATION", def: "Scale values to a common range.", hint: "Min–max or z-score." },
  { term: "PIPELINE", def: "Sequence of steps to process data and train models.", hint: "ETL + modeling." },
  { term: "FEATUREENGINEERING", def: "Transforming raw data into useful inputs.", hint: "Domain creativity." },
  { term: "CONFUSIONMATRIX", def: "Table showing TP, FP, TN, FN.", hint: "Classification summary." },
  { term: "PRECISION", def: "TP / (TP + FP).", hint: "Of predicted positives, how many are correct?" },
  { term: "RECALL", def: "TP / (TP + FN).", hint: "Of actual positives, how many did we find?" },
  { term: "F1SCORE", def: "Harmonic mean of precision and recall.", hint: "Balances both." }
];

// Shuffle helper
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

// Audio (lo-fi loop) via WebAudio
let audioCtx, master;
function initAudio(){
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain(); master.gain.value = 0.16; master.connect(audioCtx.destination);

  // Gentle chord pad + soft noise
  const beat = 60/78; // 78 bpm
  const now = audioCtx.currentTime + 0.05;
  const lowpass = audioCtx.createBiquadFilter(); lowpass.type="lowpass"; lowpass.frequency.value=1100; lowpass.Q.value=0.7; lowpass.connect(master);

  const chord = [220, 277.18, 329.63]; // A minor vibe
  chord.forEach((f,i)=>{
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type="triangle"; o.frequency.setValueAtTime(f*(i?0.995:1.005), now);
    g.gain.setValueAtTime(0.0001, now);
    for (let bar=0; bar<64; bar++){
      const t0 = now + bar*(8*beat);
      g.gain.linearRampToValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.12/(i+1), t0+beat*2);
      g.gain.linearRampToValueAtTime(0.0001, t0+8*beat);
    }
    o.connect(g).connect(lowpass); o.start();
  });

  // Soft vinyl noise
  const bufferSize = 2*audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * (Math.random()<0.006?0.5:0.02); }
  const noise = audioCtx.createBufferSource(); noise.buffer=noiseBuffer; noise.loop=true;
  const nGain = audioCtx.createGain(); nGain.gain.value = 0.04;
  noise.connect(nGain).connect(master); noise.start();
}

function sfx(freq=520, dur=0.08){
  if(!audioCtx) return;
  const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
  o.type="square"; o.frequency.value=freq;
  g.gain.setValueAtTime(0.18, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+dur);
  o.connect(g).connect(master); o.start(); o.stop(audioCtx.currentTime+dur+0.03);
}

// DOM
const elDef = document.getElementById("definition");
const elScramble = document.getElementById("scramble");
const elGuess = document.getElementById("guess");
const elHint = document.getElementById("hint");
const elScore = document.getElementById("score");
const elStreak = document.getElementById("streak");
const elRound = document.getElementById("round");
const elTotal = document.getElementById("total");
const btnHint = document.getElementById("btnHint");
const btnSkip = document.getElementById("btnSkip");
const btnPlayPause = document.getElementById("playPause");
const btnInstall = document.getElementById("install");
const btnReset = document.getElementById("reset");

let rounds = [];
let idx = 0;
let score = 0;
let streak = 0;
let running = false;
let revealed = []; // array of indices revealed for hint

function newGame(){
  rounds = shuffle(DATA_TERMS.slice()).slice(0, 15); // 15 round session
  idx = 0; score = 0; streak=0;
  elScore.textContent = score; elStreak.textContent = streak;
  elTotal.textContent = rounds.length;
  nextRound();
}

function nextRound(){
  if (idx >= rounds.length){
    gameOver(); return;
  }
  running = true;
  revealed = [];
  const item = rounds[idx];
  const letters = item.term.split("");
  const scrambled = shuffle(letters.slice());
  elDef.textContent = item.def;
  elHint.textContent = item.hint;
  renderScramble(scrambled, []);
  elGuess.value = "";
  elRound.textContent = (idx+1);
  elGuess.focus();
}

function renderScramble(letters, highlights){
  elScramble.innerHTML = "";
  letters.forEach((ch,i)=>{
    const div = document.createElement("div");
    div.className = "tile";
    div.textContent = ch;
    if (highlights[i] === "good") div.classList.add("good");
    if (highlights[i] === "bad") div.classList.add("bad");
    elScramble.appendChild(div);
  });
}

function checkGuess(){
  const item = rounds[idx];
  const g = (elGuess.value || "").toUpperCase().replace(/\s+/g,"");
  if (!g) return;
  const target = item.term.toUpperCase();
  const letters = target.split("");
  const highs = letters.map((ch,i)=> g[i] === ch ? "good" : (g[i] ? "bad" : null));
  renderScramble(letters, highs);

  if (g === target){
    sfx(700,0.1);
    const base = 10 + Math.max(0, 8 - revealed.length*2); // fewer hints => more points
    score += base; streak += 1;
    elScore.textContent = score; elStreak.textContent = streak;
    idx++;
    setTimeout(nextRound, 600);
  } else {
    sfx(240,0.12);
    streak = 0; elStreak.textContent = streak;
  }
}

function useHint(){
  const item = rounds[idx];
  const letters = item.term.split("");
  let pos = 0;
  while (revealed.includes(pos) && pos < letters.length) pos++;
  if (revealed.length >= letters.length) return;
  revealed.push(pos);
  const g = (elGuess.value || "").toUpperCase().replace(/\s+/g,"").split("");
  g[pos] = letters[pos];
  elGuess.value = g.join("");
  score = Math.max(0, score - 1); elScore.textContent = score;
  sfx(500,0.06);
}

function skip(){
  score = Math.max(0, score - 2); elScore.textContent = score;
  streak = 0; elStreak.textContent = streak;
  sfx(220,0.08);
  idx++; nextRound();
}

function gameOver(){
  running = false;
  elDef.textContent = "Session complete! Great job. Hit New Game to play again.";
  elScramble.innerHTML = "";
  elHint.textContent = "Tip: try without hints for higher scores.";
}

elGuess.addEventListener("keydown",(e)=>{
  if (e.key === "Enter"){ checkGuess(); initAudio(); }
});

btnHint.onclick = ()=>{ useHint(); initAudio(); };
btnSkip.onclick = ()=>{ skip(); initAudio(); };
btnPlayPause.onclick = ()=>{
  running = !running;
  if (running){ nextRound(); } else { gameOver(); }
  initAudio();
};
btnReset.onclick = ()=>{ newGame(); initAudio(); };

// PWA install
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault(); deferredPrompt = e; btnInstall.hidden = false;
  btnInstall.onclick = async ()=>{ deferredPrompt.prompt(); deferredPrompt = null; btnInstall.hidden=true; };
});

// Start
newGame();
