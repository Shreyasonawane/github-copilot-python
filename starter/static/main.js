// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let solution = [];
let hintedCells = new Set();
let hintCount = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let currentDifficulty = 'medium';
let currentScoreSaved = false;
const STORAGE_KEY = 'sudoku-top-scores';
const THEME_KEY = 'sudoku-theme';

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        highlightTwos();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function startTimer() {
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  document.getElementById('timer').innerText = `Time: ${formatTime(elapsedSeconds)}`;
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    document.getElementById('timer').innerText = `Time: ${formatTime(elapsedSeconds)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function renderPuzzle(puz, sol) {
  puzzle = puz;
  solution = sol || [];
  hintedCells = new Set();
  hintCount = 0;
  document.getElementById('hint-counter').innerText = 'Hints used: 0';
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className = 'sudoku-cell prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.className = 'sudoku-cell';
      }
    }
  }
  highlightTwos();
}

async function newGame() {
  currentDifficulty = document.getElementById('difficulty-selector').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(currentDifficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle, data.solution);
  document.getElementById('message').innerText = '';
  document.getElementById('message').style.color = '#333';
  currentScoreSaved = false;
  startTimer();
}

function getBoardValues() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function applyBoardStyles(incorrectIndices) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const incorrect = new Set(incorrectIndices);
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    inp.classList.remove('incorrect');
    if (!inp.disabled && incorrect.has(idx)) {
      inp.classList.add('incorrect');
    }
  }
}

function highlightTwos() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    const value = inp.value;
    inp.classList.toggle('highlight-two', value === '2');
  }
}

function loadScores() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    return [];
  }
}

function saveScores(scores) {
  const sortedScores = scores
    .slice()
    .sort((a, b) => {
      if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
      if (a.hints !== b.hints) return a.hints - b.hints;
      return a.timestamp - b.timestamp;
    })
    .slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedScores));
}

function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.innerText = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

function renderScores() {
  const scores = loadScores().sort((a, b) => {
    if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
    if (a.hints !== b.hints) return a.hints - b.hints;
    return a.timestamp - b.timestamp;
  }).slice(0, 10);

  const scoreList = document.getElementById('score-list');
  scoreList.innerHTML = '';
  if (scores.length === 0) {
    scoreList.innerHTML = '<li>No scores yet.</li>';
    return;
  }

  scores.forEach((entry, index) => {
    const item = document.createElement('li');
    item.innerText = `${index + 1}. ${entry.name} — ${formatTime(entry.timeSeconds)} — ${entry.difficulty} — ${entry.hints} hint(s)`;
    scoreList.appendChild(item);
  });
}

function saveScore() {
  if (currentScoreSaved) {
    return;
  }

  const nameInput = document.getElementById('player-name');
  const playerName = (nameInput.value || 'Anonymous').trim().slice(0, 20);
  const scores = loadScores();
  scores.push({
    name: playerName,
    timeSeconds: elapsedSeconds,
    difficulty: currentDifficulty,
    hints: hintCount,
    timestamp: Date.now()
  });
  saveScores(scores);
  renderScores();
  currentScoreSaved = true;
  document.getElementById('message').style.color = '#388e3c';
  document.getElementById('message').innerText = `Saved score for ${playerName}.`;
}

function applyHint() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const emptyCells = [];

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      if (puzzle[i][j] === 0 && !hintedCells.has(idx)) {
        emptyCells.push({idx, row: i, col: j});
      }
    }
  }

  if (emptyCells.length === 0) {
    document.getElementById('message').style.color = '#d32f2f';
    document.getElementById('message').innerText = 'No more hints available.';
    return;
  }

  const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const inp = inputs[target.idx];
  inp.value = solution[target.row][target.col];
  inp.disabled = true;
  inp.className = 'sudoku-cell prefilled hint';
  hintedCells.add(target.idx);
  highlightTwos();
  hintCount += 1;
  document.getElementById('hint-counter').innerText = `Hints used: ${hintCount}`;
  document.getElementById('message').style.color = '#1976d2';
  document.getElementById('message').innerText = `Hint used (${hintCount}).`;
}

async function checkSolution() {
  const board = getBoardValues();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  applyBoardStyles([...incorrect]);
  if (incorrect.size === 0) {
    stopTimer();
    if (!currentScoreSaved) {
      saveScore();
    }
    msg.style.color = '#388e3c';
    msg.innerText = `Congratulations! You solved it in ${formatTime(elapsedSeconds)}!`;
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  applyTheme(loadTheme());
  renderScores();
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint').addEventListener('click', applyHint);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('save-score').addEventListener('click', saveScore);
  document.getElementById('highlight-twos').addEventListener('click', highlightTwos);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  // initialize
  newGame();
});