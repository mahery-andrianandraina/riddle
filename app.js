// ==========================================================================
// app.js  —  Super Mario Quiz : Qui Suis-Je ?
// Fonctionnalités spectaculaires :
//  - Sons NES (Web Audio API, aucun fichier externe)
//  - Compteur de score animé
//  - Timer d'alerte (clignotement + bip)
//  - Confettis pixel art sur bonne réponse
//  - Tremblement d'écran sur mauvaise réponse
//  - Mario qui réagit (saute sur bonne, tombe sur mauvaise)
//  - Transition "NEXT PLAYER" entre joueurs
//  - Leaderboard auto-refresh toutes les 10s
// ==========================================================================

const gameData    = window.gameData;
const config      = gameData.settings;
let   questionsList = [];
const MAX_QUESTIONS = 8;

// ==========================================================================
// ÉTAT DU JEU
// ==========================================================================
const state = {
  playerName: '',
  score: 0,
  displayedScore: 0,       // score affiché (animé)
  scoreAnimId: null,
  currentQuestionIndex: 0,
  timerSecondsRemaining: 0,
  timerIntervalId: null,
  clueIntervalId: null,
  leaderboardRefreshId: null,
  cluesShownCount: 1,
  activeQuestion: null,
  leaderboard: []
};

let ytPlayerRevelation = null;
let ytPlayerEnding     = null;

// ==========================================================================
// WEB AUDIO ENGINE (sons NES sans fichier externe)
// ==========================================================================
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type, duration, volume, delay = 0) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch(e) {}
}

function soundCorrect() {
  // Jingle de bonne réponse NES (do-mi-sol-do)
  const notes = [[523,0],[659,0.1],[784,0.2],[1047,0.3]];
  notes.forEach(([f,d]) => playTone(f, 'square', 0.18, 0.18, d));
}

function soundWrong() {
  // Son d'erreur descendant
  playTone(300, 'sawtooth', 0.12, 0.2, 0);
  playTone(200, 'sawtooth', 0.18, 0.2, 0.12);
  playTone(150, 'sawtooth', 0.25, 0.18, 0.25);
}

function soundCoin() {
  // Son de pièce Mario
  playTone(988,  'square', 0.08, 0.15, 0);
  playTone(1319, 'square', 0.12, 0.15, 0.08);
}

function soundBeep(urgent = false) {
  // Bip timer (urgent = plus aigu)
  playTone(urgent ? 880 : 660, 'square', 0.06, 0.12, 0);
}

function soundLevelClear() {
  // Fanfare fin de jeu
  const seq = [
    [523,0],[523,0.1],[523,0.2],[415,0.3],[523,0.4],
    [659,0.5],[784,0.7]
  ];
  seq.forEach(([f,d]) => playTone(f, 'square', 0.2, 0.2, d));
}

function soundNextPlayer() {
  // Jingle "next player"
  playTone(659, 'square', 0.12, 0.18, 0);
  playTone(784, 'square', 0.12, 0.18, 0.13);
  playTone(988, 'square', 0.18, 0.18, 0.26);
}

// ==========================================================================
// DOM
// ==========================================================================
const DOM = {
  screens: {
    welcome:         document.getElementById('screen-welcome'),
    game:            document.getElementById('screen-game'),
    video:           document.getElementById('screen-video'),
    themeRevelation: document.getElementById('screen-theme-revelation'),
    results:         document.getElementById('screen-results')
  },
  welcomeForm:              document.getElementById('welcome-form'),
  playerNameInput:          document.getElementById('player-name-input'),
  gamePlayerName:           document.getElementById('game-player-name'),
  gameScore:                document.getElementById('game-score'),
  gameTimerSeconds:         document.getElementById('game-timer-seconds'),
  timerProgress:            document.getElementById('timer-progress'),
  gameProgressFill:         document.getElementById('game-progress-fill'),
  gameQuestionNumber:       document.getElementById('game-question-number'),
  gameQuestionCategory:     document.getElementById('game-question-category'),
  riddleTitle:              document.getElementById('riddle-title'),
  cluesContainer:           document.getElementById('clues-container'),
  optionsButtonsContainer:  document.getElementById('options-buttons-container'),
  feedbackOverlay:          document.getElementById('feedback-overlay'),
  feedbackIcon:             document.getElementById('feedback-icon'),
  feedbackTitle:            document.getElementById('feedback-title'),
  feedbackText:             document.getElementById('feedback-text'),
  feedbackPoints:           document.getElementById('feedback-points'),
  btnNextQuestion:          document.getElementById('btn-next-question'),
  videoPlayerRevelation:            document.getElementById('video-player-revelation'),
  ytPlayerRevelationPlaceholder:    document.getElementById('yt-player-revelation'),
  btnSkipVideo:                     document.getElementById('btn-skip-video'),
  videoPlayOverlay:                 document.getElementById('video-play-overlay'),
  btnStartVideo:                    document.getElementById('btn-start-video'),
  videoLoadingSpinner:              document.getElementById('video-loading-spinner'),
  videoSourceBadge:                 document.getElementById('video-source-badge'),
  videoProgressBar:                 document.getElementById('video-progress-bar'),
  videoProgressFill:                document.getElementById('video-progress-fill'),
  videoCurrentTime:                 document.getElementById('video-current-time'),
  videoDuration:                    document.getElementById('video-duration'),
  revealedThemeText: document.getElementById('revealed-theme-text'),
  btnGoToResults:    document.getElementById('btn-go-to-results'),
  resultsPlayerName:       document.getElementById('results-player-name'),
  resultsFinalScore:       document.getElementById('results-final-score'),
  resultsRankTitle:        document.getElementById('results-rank-title'),
  btnShareScore:           document.getElementById('btn-share-score'),
  btnRestartGame:          document.getElementById('btn-restart-game'),
  videoPlayerEnding:       document.getElementById('video-player-ending'),
  ytPlayerEndingPlaceholder: document.getElementById('yt-player-ending'),
  leaderboardTbody:        document.getElementById('leaderboard-tbody'),
};

// YouTube API
if (!window.YT) {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);
}

function ensureYTReady() {
  return new Promise(resolve => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const id = setInterval(() => { if (window.YT && window.YT.Player) { clearInterval(id); resolve(); } }, 100);
    setTimeout(() => { clearInterval(id); resolve(); }, 4000);
  });
}

// ==========================================================================
// UTILITAIRES
// ==========================================================================
function showScreen(key) {
  Object.values(DOM.screens).forEach(s => s && s.classList.remove('active'));
  DOM.screens[key] && DOM.screens[key].classList.add('active');
}

function formatScore(n) { return String(Math.round(n)).padStart(4, '0'); }

function formatTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getRankBadge(score, max) {
  const r = score / max;
  if (r >= 0.85) return "DETECTIVE D'OR — LEGENDAIRE";
  if (r >= 0.60) return "AGENT SPECIAL — EXCELLENT";
  if (r >= 0.35) return "ENQUETEUR JUNIOR — PAS MAL";
  return "STAGIAIRE PERDU — PEUT MIEUX FAIRE";
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]||t));
}

function getCategoryLabel(cat) {
  return {
    "coworker":    "COLLEGUE",
    "tool":        "OUTIL",
    "office-life": "VIE DE BUREAU",
    "process":     "PROCESS METIER",
    "personality": "PERSONNALITE"
  }[cat] || "DIVERS";
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==========================================================================
// COMPTEUR DE SCORE ANIME
// ==========================================================================
function animateScore(from, to, duration = 800) {
  cancelAnimationFrame(state.scoreAnimId);
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const current = Math.round(from + (to - from) * eased);
    DOM.gameScore.textContent = formatScore(current);
    state.displayedScore = current;
    if (t < 1) state.scoreAnimId = requestAnimationFrame(step);
    else DOM.gameScore.textContent = formatScore(to);
  }
  state.scoreAnimId = requestAnimationFrame(step);
}

// ==========================================================================
// CONFETTIS PIXEL ART (bonne réponse)
// ==========================================================================
function launchConfetti() {
  const colors = ['#f8b800','#e52521','#00a800','#5c94fc','#ffffff','#fcd8a0'];
  const container = document.body;
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;
      top:-10px;
      left:${Math.random()*100}vw;
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      z-index:9999;
      pointer-events:none;
      animation: confettiFall ${0.8+Math.random()*1.2}s linear forwards;
      animation-delay:${Math.random()*0.4}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

// ==========================================================================
// TREMBLEMENT D'ECRAN (mauvaise réponse)
// ==========================================================================
function shakeScreen() {
  document.body.classList.add('screen-shake');
  setTimeout(() => document.body.classList.remove('screen-shake'), 500);
}

// ==========================================================================
// MARIO REACTION (communique avec mario-bg.js via custom events)
// ==========================================================================
function marioReact(type) {
  // 'correct' = Mario saute de joie, 'wrong' = Mario clignote
  window.dispatchEvent(new CustomEvent('mario-react', { detail: { type } }));
}

// ==========================================================================
// ECRAN "NEXT PLAYER"
// ==========================================================================
function showNextPlayerScreen(nextName, callback) {
  soundNextPlayer();
  const overlay = document.createElement('div');
  overlay.id = 'next-player-overlay';
  overlay.innerHTML = `
    <div class="next-player-content">
      <p class="next-player-pre">PROCHAIN JOUEUR</p>
      <h2 class="next-player-name">${escapeHTML(nextName)}</h2>
      <p class="next-player-hint">PRET ?</p>
      <button class="btn btn-primary next-player-btn">JOUER !</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  overlay.querySelector('.next-player-btn').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => { overlay.remove(); callback(); }, 400);
  });
}

// ==========================================================================
// LEADERBOARD
// ==========================================================================
function loadLeaderboard(cb) {
  if (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") {
    const callbackName = 'gsCallback_' + Date.now();
    const script = document.createElement('script');

    window[callbackName] = function(data) {
      delete window[callbackName];
      try { document.body.removeChild(script); } catch(e){}
      if (Array.isArray(data)) { state.leaderboard = data; cb && cb(data); }
      else loadLocalLeaderboard(cb);
    };

    const timeout = setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        try { document.body.removeChild(script); } catch(e){}
        loadLocalLeaderboard(cb);
      }
    }, 5000);

    script.onerror = () => { clearTimeout(timeout); delete window[callbackName]; loadLocalLeaderboard(cb); };
    script.src = config.googleSheetsUrl + '?action=get&callback=' + callbackName + '&t=' + Date.now();
    document.body.appendChild(script);
  } else {
    loadLocalLeaderboard(cb);
  }
}

function loadLocalLeaderboard(cb) {
  const s = localStorage.getItem('synapse_leaderboard');
  state.leaderboard = s ? JSON.parse(s) : [];
  cb && cb(state.leaderboard);
}

function sendScore(name, score, cb) {
  if (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") {
    saveScoreLocal(name, score, cb);
    fetch(config.googleSheetsUrl, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ playerName: name, score })
    })
    .then(() => setTimeout(() => loadLeaderboard(renderLeaderboardView), 1000))
    .catch(() => console.warn("Envoi GS échoué, score conservé en local."));
  } else {
    saveScoreLocal(name, score, cb);
  }
}

function saveScoreLocal(name, score, cb) {
  loadLocalLeaderboard(() => {
    state.leaderboard.push({
      playerName: name, score,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    });
    state.leaderboard.sort((a, b) => b.score - a.score);
    state.leaderboard = state.leaderboard.slice(0, 10);
    localStorage.setItem('synapse_leaderboard', JSON.stringify(state.leaderboard));
    cb && cb(state.leaderboard);
  });
}

function renderLeaderboardView() {
  DOM.leaderboardTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Chargement...</td></tr>`;
  loadLeaderboard(list => {
    DOM.leaderboardTbody.innerHTML = '';
    if (!list || list.length === 0) {
      DOM.leaderboardTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Aucun score. Soyez le premier !</td></tr>`;
      return;
    }
    list.forEach((e, i) => {
      const row = document.createElement('tr');
      const medals = ['1', '2', '3'];
      const rank = i < 3 ? medals[i] : (i + 1);
      row.innerHTML = `
        <td class="rank-cell rank-${i+1}">${rank}</td>
        <td style="font-weight:500;color:var(--text-primary);">${escapeHTML(e.playerName)}</td>
        <td style="font-family:var(--font-pixel);color:var(--color-coin-yellow);">${e.score} pts</td>
        <td style="color:var(--text-muted);">${e.date || 'Recemment'}</td>`;
      // Surligner le joueur actuel
      if (e.playerName === state.playerName) row.classList.add('current-player-row');
      DOM.leaderboardTbody.appendChild(row);
    });
  });
}

// Auto-refresh leaderboard toutes les 10s sur l'écran résultats
function startLeaderboardAutoRefresh() {
  stopLeaderboardAutoRefresh();
  state.leaderboardRefreshId = setInterval(() => {
    if (DOM.screens.results.classList.contains('active')) renderLeaderboardView();
  }, 10000);
}

function stopLeaderboardAutoRefresh() {
  if (state.leaderboardRefreshId) clearInterval(state.leaderboardRefreshId);
}

// ==========================================================================
// MOTEUR DE JEU
// ==========================================================================
function initGame() {
  questionsList = gameData.getShuffledQuestions(MAX_QUESTIONS);
  state.score = 0;
  state.displayedScore = 0;
  state.currentQuestionIndex = 0;
  DOM.gameScore.textContent = formatScore(0);
  stopLeaderboardAutoRefresh();
  showScreen('welcome');
  renderLeaderboardView();
}

function startPlay() {
  const n = DOM.playerNameInput.value.trim().toUpperCase();
  state.playerName = n || 'ANONYME';
  DOM.gamePlayerName.textContent = state.playerName;
  showScreen('game');
  loadQuestion(0);
}

function loadQuestion(index) {
  state.currentQuestionIndex  = index;
  state.activeQuestion        = questionsList[index];
  state.cluesShownCount       = 1;
  state.timerSecondsRemaining = config.timeLimitSeconds;

  DOM.gameProgressFill.style.width    = `${(index / questionsList.length) * 100}%`;
  DOM.gameQuestionNumber.textContent  = `QUESTION ${index + 1} / ${questionsList.length}`;
  DOM.gameQuestionCategory.textContent = getCategoryLabel(state.activeQuestion.category);
  DOM.riddleTitle.textContent         = state.activeQuestion.title || "QUI SUIS-JE ?";
  DOM.cluesContainer.innerHTML        = '';

  // Options mélangées
  const options = shuffleArray([...state.activeQuestion.options]);
  DOM.optionsButtonsContainer.innerHTML = '';
  options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.id = `btn-option-${idx}`;
    btn.className = 'btn btn-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswerSelect(opt, btn));
    DOM.optionsButtonsContainer.appendChild(btn);
  });

  revealClue(0);
  updateTimerVisual(config.timeLimitSeconds, config.timeLimitSeconds);
  DOM.timerProgress.classList.remove('warning');
  DOM.gameTimerSeconds.classList.remove('timer-urgent');
  startTimer();
  startClueTriggers();
}

function revealClue(idx) {
  const text = state.activeQuestion.clues[idx];
  if (!text) return;
  state.cluesShownCount = idx + 1;
  DOM.cluesContainer.querySelectorAll('.clue-item').forEach(c => c.classList.remove('active'));
  const el = document.createElement('div');
  el.className = 'clue-item active';
  el.style.animationDelay = '0s';
  el.innerHTML = `<span class="clue-label">INDICE ${idx + 1}</span><p>${text}</p>`;
  DOM.cluesContainer.appendChild(el);
  soundCoin();
}

// ==========================================================================
// TIMER AVEC BIPS D'ALERTE
// ==========================================================================
function startTimer() {
  clearInterval(state.timerIntervalId);
  DOM.gameTimerSeconds.textContent = state.timerSecondsRemaining;

  state.timerIntervalId = setInterval(() => {
    state.timerSecondsRemaining--;
    DOM.gameTimerSeconds.textContent = state.timerSecondsRemaining;
    updateTimerVisual(state.timerSecondsRemaining, config.timeLimitSeconds);

    // Alerte visuelle + sonore à 5 secondes
    if (state.timerSecondsRemaining <= 5) {
      DOM.timerProgress.classList.add('warning');
      DOM.gameTimerSeconds.classList.add('timer-urgent');
      soundBeep(state.timerSecondsRemaining <= 3); // bips plus urgents à 3s
    }

    if (state.timerSecondsRemaining <= 0) handleTimeOut();
  }, 1000);
}

function startClueTriggers() {
  clearInterval(state.clueIntervalId);
  const delay = Math.floor(config.timeLimitSeconds / 3);
  state.clueIntervalId = setInterval(() => {
    const next = state.cluesShownCount;
    const trigger = config.timeLimitSeconds - (next * delay);
    if (state.timerSecondsRemaining <= trigger && next < state.activeQuestion.clues.length) {
      revealClue(next);
    }
    if (state.cluesShownCount >= state.activeQuestion.clues.length) clearInterval(state.clueIntervalId);
  }, 250);
}

function updateTimerVisual(val, max) {
  DOM.timerProgress.setAttribute('stroke-dasharray', `${(val / max) * 100}, 100`);
}

function stopQuestionIntervals() {
  clearInterval(state.timerIntervalId);
  clearInterval(state.clueIntervalId);
}

function calculateScore(timeLeft, cluesShown) {
  const base = config.pointsPerQuestion - (300 * (cluesShown - 1));
  return Math.max(100, Math.round(base * (0.6 + 0.4 * timeLeft / config.timeLimitSeconds)));
}

// ==========================================================================
// GESTION DES REPONSES
// ==========================================================================
function handleAnswerSelect(selected, buttonEl) {
  stopQuestionIntervals();
  const isCorrect = selected === state.activeQuestion.correctAnswer;
  let pts = 0;

  DOM.optionsButtonsContainer.querySelectorAll('.btn-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === state.activeQuestion.correctAnswer) {
      btn.style.background  = 'rgba(16,185,129,0.25)';
      btn.style.borderColor = 'var(--color-green)';
      btn.style.boxShadow   = '0 0 0 3px rgba(16,185,129,0.4), 3px 3px 0 #000';
    } else if (btn === buttonEl && !isCorrect) {
      btn.style.background  = 'rgba(239,68,68,0.25)';
      btn.style.borderColor = 'var(--color-red)';
      btn.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.4), 3px 3px 0 #000';
    }
  });

  if (isCorrect) {
    pts = calculateScore(state.timerSecondsRemaining, state.cluesShownCount);
    const prevScore = state.score;
    state.score += pts;
    soundCorrect();
    launchConfetti();
    marioReact('correct');
    animateScore(prevScore, state.score);
  } else {
    soundWrong();
    shakeScreen();
    marioReact('wrong');
    DOM.riddleTitle.classList.add('shake');
  }

  setTimeout(() => {
    DOM.riddleTitle.classList.remove('shake');
    DOM.feedbackOverlay.className = 'feedback-overlay';

    if (isCorrect) {
      DOM.feedbackOverlay.classList.add('correct');
      DOM.feedbackIcon.textContent   = '+';
      DOM.feedbackTitle.textContent  = 'BONNE REPONSE !';
      DOM.feedbackTitle.style.color  = 'var(--color-green)';
      DOM.feedbackPoints.textContent = `+${pts} PTS`;
    } else {
      DOM.feedbackOverlay.classList.add('incorrect');
      DOM.feedbackIcon.textContent   = 'X';
      DOM.feedbackTitle.textContent  = 'INCORRECT !';
      DOM.feedbackTitle.style.color  = 'var(--color-red)';
      DOM.feedbackPoints.textContent = '0 PTS';
    }

    DOM.feedbackText.innerHTML = `La bonne reponse etait <strong>${state.activeQuestion.correctAnswer}</strong>.<br><br>${state.activeQuestion.funFact || ''}`;
    DOM.feedbackOverlay.classList.add('active');
  }, 600);
}

function handleTimeOut() {
  stopQuestionIntervals();
  soundWrong();
  shakeScreen();
  marioReact('wrong');

  DOM.optionsButtonsContainer.querySelectorAll('.btn-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === state.activeQuestion.correctAnswer) {
      btn.style.background  = 'rgba(16,185,129,0.25)';
      btn.style.borderColor = 'var(--color-green)';
    }
  });

  DOM.feedbackOverlay.className = 'feedback-overlay incorrect';
  DOM.feedbackIcon.textContent   = '!';
  DOM.feedbackTitle.textContent  = 'TEMPS ECOULE !';
  DOM.feedbackTitle.style.color  = 'var(--color-red)';
  DOM.feedbackPoints.textContent = '0 PTS';
  DOM.feedbackText.innerHTML     = `Vous avez manque de temps. La bonne reponse etait <strong>${state.activeQuestion.correctAnswer}</strong>.`;
  DOM.feedbackOverlay.classList.add('active');
}

function handleNextQuestion() {
  DOM.feedbackOverlay.classList.remove('active');
  const next = state.currentQuestionIndex + 1;

  if (next >= questionsList.length) {
    soundLevelClear();
    sendScore(state.playerName, state.score, () => {});
    showRevelationVideo();
    return;
  }

  loadQuestion(next);
}

// ==========================================================================
// VIDEO REVELATION
// ==========================================================================
function isNativeVideo(type) { return type === "cloudinary" || type === "direct"; }
function isEmbedVideo(type)  { return type === "cloudinary-embed"; }

function showSourceBadge(type) {
  if (!DOM.videoSourceBadge) return;
  const labels = { cloudinary:"CLOUDINARY", "cloudinary-embed":"CLOUDINARY", youtube:"YOUTUBE", direct:"LOCAL" };
  DOM.videoSourceBadge.textContent = labels[type] || type;
  DOM.videoSourceBadge.style.display = "block";
}

function bindVideoTrigger(videoEl, onEnded) {
  if (!videoEl) return;
  videoEl.addEventListener('contextmenu', e => e.preventDefault());
  videoEl.addEventListener('ended', onEnded, { once: true });
}

function showRevelationVideo() {
  showScreen('video');

  const vType = config.revelationVideoType;
  const vId   = config.revelationVideoId;

  DOM.videoPlayOverlay.style.display = 'flex';
  if (DOM.videoLoadingSpinner) DOM.videoLoadingSpinner.style.display = 'none';

  DOM.videoPlayerRevelation.style.display = 'none';
  DOM.videoPlayerRevelation.pause();
  DOM.videoPlayerRevelation.removeAttribute('src');
  DOM.ytPlayerRevelationPlaceholder.style.display = 'none';
  if (ytPlayerRevelation) { try { ytPlayerRevelation.destroy(); } catch(e){} ytPlayerRevelation = null; }

  showSourceBadge(vType);

  const onEnded = () => {
    if (ytPlayerRevelation) { try { ytPlayerRevelation.destroy(); } catch(e){} ytPlayerRevelation = null; }
    showThemeRevelationScreen();
  };

  const play = () => {
    DOM.videoPlayOverlay.style.display = 'none';

    if (vType === "cloudinary-embed") {
      const placeholder = DOM.ytPlayerRevelationPlaceholder;
      placeholder.style.display = 'block';
      placeholder.innerHTML = '';

      const embedUrl = vId + (vId.includes('?') ? '&' : '?')
        + 'autoplay=true&controls=false&muted=false&loop=false&playsinline=true';

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.width = '100%'; iframe.height = '100%';
      iframe.style.border = 'none'; iframe.style.display = 'block';
      iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = false;

      if (DOM.videoLoadingSpinner) DOM.videoLoadingSpinner.style.display = 'flex';
      iframe.addEventListener('load', () => {
        if (DOM.videoLoadingSpinner) DOM.videoLoadingSpinner.style.display = 'none';
      });
      placeholder.appendChild(iframe);

      let triggered = false;
      const triggerTheme = () => {
        if (triggered) return;
        triggered = true;
        placeholder.innerHTML = '';
        placeholder.style.display = 'none';
        onEnded();
      };

      const endTimer = setTimeout(triggerTheme, 25 * 1000);
      window.addEventListener('message', function onCldMsg(e) {
        if (!e.data) return;
        try {
          const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (msg.event === 'ended' || msg.type === 'ended') {
            clearTimeout(endTimer);
            window.removeEventListener('message', onCldMsg);
            triggerTheme();
          }
        } catch(err) {}
      });
    }
    else if (vType === "cloudinary" || vType === "direct") {
      if (DOM.videoLoadingSpinner) DOM.videoLoadingSpinner.style.display = 'flex';
      const vid = DOM.videoPlayerRevelation;
      vid.style.display = 'block';
      vid.style.width = '100%'; vid.style.height = '100%';
      vid.style.objectFit = 'contain';
      vid.src = vId; vid.load();
      vid.addEventListener('canplay', () => { if (DOM.videoLoadingSpinner) DOM.videoLoadingSpinner.style.display = 'none'; }, { once: true });
      vid.play().catch(() => onEnded());
      bindVideoTrigger(vid, onEnded);
    }
    else if (vType === "youtube") {
      ensureYTReady().then(() => {
        DOM.ytPlayerRevelationPlaceholder.style.display = 'block';
        ytPlayerRevelation = new YT.Player('yt-player-revelation', {
          height: '100%', width: '100%', videoId: vId,
          playerVars: { autoplay:1, controls:1, modestbranding:1, rel:0, playsinline:1 },
          events: {
            onReady: e => e.target.playVideo(),
            onStateChange: e => { if (e.data === YT.PlayerState.ENDED) onEnded(); }
          }
        });
      });
    }
  };

  DOM.videoPlayOverlay.onclick = play;
  if (DOM.btnStartVideo) DOM.btnStartVideo.onclick = e => { e.stopPropagation(); play(); };
}

// ==========================================================================
// REVELATION THEME
// ==========================================================================
function showThemeRevelationScreen() {
  DOM.revealedThemeText.textContent = config.themeToReveal || "SURPRISE 2026";
  soundLevelClear();
  showScreen('themeRevelation');
}

// ==========================================================================
// VIDEO DE FIN
// ==========================================================================
function startEndingVideo() {
  const vType = config.endingVideoType, vId = config.endingVideoId;
  DOM.videoPlayerEnding.style.display = 'none';
  DOM.ytPlayerEndingPlaceholder.style.display = 'none';
  DOM.videoPlayerEnding.pause();
  if (ytPlayerEnding) { try { ytPlayerEnding.destroy(); } catch(e){} ytPlayerEnding = null; }

  if (vType === "youtube") {
    ensureYTReady().then(() => {
      DOM.ytPlayerEndingPlaceholder.style.display = 'block';
      ytPlayerEnding = new YT.Player('yt-player-ending', {
        height:'100%', width:'100%', videoId:vId,
        playerVars:{autoplay:1,controls:0,disablekb:1,fs:0,iv_load_policy:3,loop:1,playlist:vId,modestbranding:1,mute:1,rel:0,playsinline:1},
        events:{onReady:e=>{e.target.mute();e.target.playVideo();}}
      });
    });
  } else {
    DOM.videoPlayerEnding.style.display = 'block';
    DOM.videoPlayerEnding.src = vId;
    DOM.videoPlayerEnding.muted = true;
    DOM.videoPlayerEnding.loop = true;
    DOM.videoPlayerEnding.load();
    DOM.videoPlayerEnding.play().catch(()=>{});
  }
}

function stopEndingVideo() {
  if (isNativeVideo(config.endingVideoType)) DOM.videoPlayerEnding.pause();
  else if (ytPlayerEnding) { try { ytPlayerEnding.destroy(); } catch(e){} ytPlayerEnding = null; }
}

// ==========================================================================
// FIN DE JEU
// ==========================================================================
function endGame() {
  DOM.resultsPlayerName.textContent = state.playerName;

  // Score final animé depuis 0
  DOM.resultsFinalScore.textContent = '0';
  let displayed = 0;
  const target = state.score;
  const duration = 1200;
  const start = performance.now();
  function animFinal(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    displayed = Math.round(eased * target);
    DOM.resultsFinalScore.textContent = displayed;
    if (t < 1) requestAnimationFrame(animFinal);
    else {
      DOM.resultsFinalScore.textContent = target;
      soundLevelClear();
    }
  }
  requestAnimationFrame(animFinal);

  const max = questionsList.length * config.pointsPerQuestion;
  DOM.resultsRankTitle.textContent = getRankBadge(state.score, max);

  showScreen('results');
  startEndingVideo();
  renderLeaderboardView();
  startLeaderboardAutoRefresh();
}

function shareScore() {
  const max = questionsList.length * config.pointsPerQuestion;
  const badge = getRankBadge(state.score, max);
  const text  = `Super Mario Quiz - Edition Equipe\nJoueur : ${state.playerName}\nScore : ${state.score} pts\nRang : ${badge}\nRelevez le defi !`;
  navigator.clipboard.writeText(text)
    .then(() => {
      const orig = DOM.btnShareScore.innerHTML;
      DOM.btnShareScore.innerHTML = '<span>COPIE !</span>';
      setTimeout(() => DOM.btnShareScore.innerHTML = orig, 2000);
    })
    .catch(() => alert(text));
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  DOM.welcomeForm.addEventListener('submit', e => { e.preventDefault(); startPlay(); });
  DOM.btnNextQuestion.addEventListener('click', handleNextQuestion);
  DOM.btnShareScore.addEventListener('click', shareScore);
  DOM.btnGoToResults.addEventListener('click', endGame);
  DOM.btnRestartGame.addEventListener('click', () => {
    stopEndingVideo();
    stopLeaderboardAutoRefresh();
    initGame();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initGame();
});
