// ---- Data soal (minimal 5, sesuai requirement) ----
const quizData = [
  {
    question: 'Apa kepanjangan dari DOM?',
    options: [
      'Document Object Model',
      'Data Object Management',
      'Display Output Mode',
      'Document Order Method'
    ],
    correct: 0
  },
  {
    question: 'Method mana yang termasuk cara MODERN untuk memilih elemen HTML?',
    options: ['getElementById saja', 'querySelector', 'document.write', 'eval'],
    correct: 1
  },
  {
    question: 'Kenapa textContent lebih aman dibanding innerHTML untuk input user?',
    options: [
      'Lebih pendek ditulis',
      'Bisa jalankan CSS',
      'Tidak mem-parse HTML, jadi aman dari XSS',
      'Lebih cepat di-load browser'
    ],
    correct: 2
  },
  {
    question: 'Apa keuntungan utama event delegation?',
    options: [
      'Kode jadi lebih panjang',
      '1 listener bisa handle banyak elemen, termasuk yang dibuat dinamis',
      'Event tidak bisa di-bubble',
      'Hanya bekerja di Internet Explorer'
    ],
    correct: 1
  },
  {
    question: 'Data seperti apa yang bisa disimpan langsung di localStorage?',
    options: [
      'Hanya angka',
      'Hanya boolean',
      'String (object/array harus di-JSON.stringify dulu)',
      'Semua tipe data tanpa konversi'
    ],
    correct: 2
  },
  {
    question: 'Method apa yang dipakai untuk mencari parent terdekat dengan selector tertentu?',
    options: ['parentElement', 'closest()', 'nextElementSibling', 'children'],
    correct: 1
  }
];

const TIME_PER_QUESTION = 15;
const HIGHSCORE_KEY = 'quizHighScore';

// ---- State ----
let currentQuestion = 0;
let score = 0;
let answered = false;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;

// ---- DOM Elements ----
const questionEl = document.querySelector('#question');
const optionsEl = document.querySelector('#options');
const nextBtn = document.querySelector('#nextBtn');
const progressEl = document.querySelector('#progress');
const progressFill = document.querySelector('#progressFill');
const timerEl = document.querySelector('#timer');
const quizContent = document.querySelector('.quiz-content');
const resultEl = document.querySelector('#result');
const scoreEl = document.querySelector('#score');
const highScoreEl = document.querySelector('#highScore');
const highScoreLiveEl = document.querySelector('#highScoreLive');
const themeBtn = document.querySelector('#themeBtn');

// ---- Ambil & tampilkan High Score tersimpan (dipanggil di awal & tiap update) ----
function getHighScore() {
  try {
    return parseInt(localStorage.getItem(HIGHSCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}
function refreshHighScoreBadge() {
  highScoreLiveEl.textContent = `${getHighScore()}%`;
}

// ---- Timer per soal (bonus) ----
const startTimer = () => {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  timerEl.textContent = `⏱ ${timeLeft}s`;
  timerId = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      if (!answered) lockAnswers(-1); // waktu habis, tidak ada yang dipilih
    }
  }, 1000);
};

// ---- Render soal (createElement + textContent, sesuai requirement) ----
function renderQuestion() {
  answered = false;
  const q = quizData[currentQuestion];

  progressEl.textContent = `Soal ${currentQuestion + 1}/${quizData.length}`;
  progressFill.style.width = `${((currentQuestion) / quizData.length) * 100}%`;
  questionEl.textContent = q.question;

  optionsEl.innerHTML = '';
  q.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = option;              // textContent -> aman dari XSS
    btn.classList.add('option-btn');
    btn.dataset.index = index;
    optionsEl.append(btn);
  });

  nextBtn.classList.add('hidden');
  startTimer();
}

// ---- Kunci semua pilihan & beri feedback visual ----
function lockAnswers(selectedIndex) {
  answered = true;
  clearInterval(timerId);
  const correctIndex = quizData[currentQuestion].correct;

  [...optionsEl.children].forEach((btn) => {
    const idx = parseInt(btn.dataset.index);
    btn.disabled = true;
    if (idx === correctIndex) btn.classList.add('correct');
    else if (idx === selectedIndex) btn.classList.add('wrong');
  });

  if (selectedIndex === correctIndex) score++;
  nextBtn.classList.remove('hidden');
}

// ---- Event Delegation: 1 listener untuk semua tombol pilihan ----
optionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.option-btn');
  if (!btn || answered) return;
  lockAnswers(parseInt(btn.dataset.index));
});

// ---- Navigasi tanpa reload (SPA pattern) ----
nextBtn.addEventListener('click', () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

// ---- Hasil akhir & High Score (LocalStorage) ----
function showResult() {
  clearInterval(timerId);
  progressFill.style.width = '100%';

  const total = quizData.length;
  const percentage = Math.round((score / total) * 100);
  scoreEl.textContent = `${score}/${total} (${percentage}%)`;

  const savedHighScore = getHighScore();

  if (percentage > savedHighScore) {
    try { localStorage.setItem(HIGHSCORE_KEY, percentage); } catch { /* abaikan */ }
    highScoreEl.textContent = `${percentage}% 🎉 Rekor baru!`;
  } else {
    highScoreEl.textContent = `${savedHighScore}%`;
  }

  refreshHighScoreBadge(); // update badge biar sinkron kalau lanjut restart
  quizContent.classList.add('hidden');
  resultEl.classList.remove('hidden');
}

// ---- Restart quiz ----
document.querySelector('#restartBtn').addEventListener('click', () => {
  currentQuestion = 0;
  score = 0;
  resultEl.classList.add('hidden');
  quizContent.classList.remove('hidden');
  renderQuestion();
});

// ---- Dark / light mode toggle (bonus) ----
const THEME_KEY = 'quizapp_theme';
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'light' ? '☀️' : '🌙';
};
themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(current);
  try { localStorage.setItem(THEME_KEY, current); } catch { /* abaikan */ }
});
try {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);
} catch { /* abaikan */ }

// ---- Inisialisasi ----
refreshHighScoreBadge();
renderQuestion();
