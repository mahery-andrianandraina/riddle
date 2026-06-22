// ==========================================================================
// app.js  —  Super Mario Quiz : Qui Suis-Je ?
// ==========================================================================

const gameData     = window.gameData;
const config       = gameData.settings;

// Pool de questions mélangé à chaque partie
let questionsList  = [];

// Combien de questions par partie (null = toutes)
const MAX_QUESTIONS = 8;

// ==========================================================================
// ÉTAT DU JEU
// ==========================================================================
const state = {
  playerName: '',
  score: 0,
  currentQuestionIndex: 0,
  timerSecondsRemaining: 0,
  timerIntervalId: null,
  clueIntervalId: null,
  cluesShownCount: 1,
  activeQuestion: null,
  leaderboard: []
};

let ytPlayerRevelation = null;
let ytPlayerEnding     = null;

// ==========================================================================
// ÉLÉMENTS DOM
// ==========================================================================
const DOM = {
  screens: {
    welcome:          document.getElementById('screen-welcome'),
    game:             document.getElementById('screen-game'),
    video:            document.getElementById('screen-video'),
    themeRevelation:  document.getElementById('screen-theme-revelation'),
    results:          document.getElementById('screen-results')
  },
  welcomeForm:        document.getElementById('welcome-form'),
  playerNameInput:    document.getElementById('player-name-input'),
  gamePlayerName:     document.getElementById('game-player-name'),
  gameScore:          document.getElementById('game-score'),
  gameTimerSeconds:   document.getElementById('game-timer-seconds'),
  timerProgress:      document.getElementById('timer-progress'),
  gameProgressFill:   document.getElementById('game-progress-fill'),
  gameQuestionNumber: document.getElementById('game-question-number'),
  gameQuestionCategory: document.getElementById('game-question-category'),
  riddleTitle:        document.getElementById('riddle-title'),
  cluesContainer:     document.getElementById('clues-container'),
  optionsButtonsContainer: document.getElementById('options-buttons-container'),
  feedbackOverlay:    document.getElementById('feedback-overlay'),
  feedbackIcon:       document.getElementById('feedback-icon'),
  feedbackTitle:      document.getElementById('feedback-title'),
  feedbackText:       document.getElementById('feedback-text'),
  feedbackPoints:     document.getElementById('feedback-points'),
  btnNextQuestion:    document.getElementById('btn-next-question'),
  videoPlayerRevelation:        document.getElementById('video-player-revelation'),
  ytPlayerRevelationPlaceholder: document.getElementById('yt-player-revelation'),
  btnSkipVideo:       document.getElementById('btn-skip-video'),
  videoPlayOverlay:   document.getElementById('video-play-overlay'),
  btnStartVideo:      document.getElementById('btn-start-video'),
  revealedThemeText:  document.getElementById('revealed-theme-text'),
  btnGoToResults:     document.getElementById('btn-go-to-results'),
  resultsPlayerName:  document.getElementById('results-player-name'),
  resultsFinalScore:  document.getElementById('results-final-score'),
  resultsRankTitle:   document.getElementById('results-rank-title'),
  btnShareScore:      document.getElementById('btn-share-score'),
  btnRestartGame:     document.getElementById('btn-restart-game'),
  videoPlayerEnding:  document.getElementById('video-player-ending'),
  ytPlayerEndingPlaceholder: document.getElementById('yt-player-ending'),
  leaderboardTbody:   document.getElementById('leaderboard-tbody'),
  btnClearScores:     document.getElementById('btn-clear-scores')
};

// YouTube API
if (!window.YT) {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);
}

function ensureYTReady() {
  return new Promise((resolve) => {
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

function formatScore(n) { return String(n).padStart(4, '0'); }

function getRankBadge(score, max) {
  const r = score / max;
  if (r >= 0.85) return "Détective d'Or 🕵️‍♂️ (Légendaire)";
  if (r >= 0.60) return "Agent Spécial 🕵️ (Excellent)";
  if (r >= 0.35) return "Enquêteur Junior 🧐 (Pas mal)";
  return "Stagiaire Perdu 🤷‍♂️ (Peut mieux faire)";
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]||t));
}

// Badge de catégorie avec emoji
function getCategoryLabel(cat) {
  const map = {
    "coworker":    "👤 Collègue",
    "tool":        "🔧 Outil",
    "office-life": "🏢 Vie de Bureau",
    "process":     "⚙️ Process Métier",
    "personality": "🧠 Personnalité"
  };
  return map[cat] || "❓ Divers";
}

// ==========================================================================
// CLASSEMENT
// ==========================================================================
function loadLeaderboard(cb) {
  if (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") {
    fetch(config.googleSheetsUrl)
      .then(r => r.json())
      .then(d => { state.leaderboard = d; cb && cb(d); })
      .catch(() => loadLocalLeaderboard(cb));
  } else { loadLocalLeaderboard(cb); }
}

function loadLocalLeaderboard(cb) {
  const s = localStorage.getItem('synapse_leaderboard');
  state.leaderboard = s ? JSON.parse(s) : [];
  cb && cb(state.leaderboard);
}

function sendScore(name, score, cb) {
  if (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") {
    fetch(config.googleSheetsUrl, { method:'POST', mode:'cors', body: JSON.stringify({ playerName:name, score }) })
      .then(() => loadLeaderboard(cb))
      .catch(() => saveScoreLocal(name, score, cb));
  } else { saveScoreLocal(name, score, cb); }
}

function saveScoreLocal(name, score, cb) {
  loadLocalLeaderboard(() => {
    state.leaderboard.push({
      playerName: name,
      score,
      date: new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'short' })
    });
    state.leaderboard.sort((a,b) => b.score - a.score);
    state.leaderboard = state.leaderboard.slice(0, 10);
    localStorage.setItem('synapse_leaderboard', JSON.stringify(state.leaderboard));
    cb && cb(state.leaderboard);
  });
}

function renderLeaderboardView() {
  DOM.leaderboardTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Chargement…</td></tr>`;
  loadLeaderboard(list => {
    DOM.leaderboardTbody.innerHTML = '';
    if (!list || list.length === 0) {
      DOM.leaderboardTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem;">Aucun score. Soyez le premier !</td></tr>`;
      return;
    }
    list.forEach((e, i) => {
      const row = document.createElement('tr');
      let rank = i + 1;
      if (i === 0) rank = '🥇';
      else if (i === 1) rank = '🥈';
      else if (i === 2) rank = '🥉';
      row.innerHTML = `
        <td>${rank}</td>
        <td style="font-weight:500;color:var(--text-primary);">${escapeHTML(e.playerName)}</td>
        <td style="font-family:var(--font-pixel);color:var(--color-coin-yellow);">${e.score} pts</td>
        <td style="font-size:0.8rem;color:var(--text-muted);">${e.date || 'Récemment'}</td>`;
      DOM.leaderboardTbody.appendChild(row);
    });
  });
}

// ==========================================================================
// MOTEUR DE JEU
// ==========================================================================
function initGame() {
  // Mélanger le pool à chaque nouvelle partie
  questionsList = gameData.getShuffledQuestions(MAX_QUESTIONS);

  state.score = 0;
  state.currentQuestionIndex = 0;
  DOM.gameScore.textContent = formatScore(0);
  showScreen('welcome');
  renderLeaderboardView();
}

function startPlay() {
  const n = DOM.playerNameInput.value.trim();
  state.playerName = n || 'Anonyme';
  DOM.gamePlayerName.textContent = state.playerName;
  showScreen('game');
  loadQuestion(0);
}

function loadQuestion(index) {
  state.currentQuestionIndex    = index;
  state.activeQuestion          = questionsList[index];
  state.cluesShownCount         = 1;
  state.timerSecondsRemaining   = config.timeLimitSeconds;

  // Barre de progression
  DOM.gameProgressFill.style.width = `${(index / questionsList.length) * 100}%`;
  DOM.gameQuestionNumber.textContent = `Question ${index + 1} / ${questionsList.length}`;

  // Catégorie
  DOM.gameQuestionCategory.textContent = getCategoryLabel(state.activeQuestion.category);

  // Titre
  DOM.riddleTitle.textContent = state.activeQuestion.title || "Qui suis-je ?";

  // Vider les indices
  DOM.cluesContainer.innerHTML = '';

  // Générer les boutons de réponse (ordre aléatoire)
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

  // Premier indice
  revealClue(0);

  // Timer
  updateTimerVisual(config.timeLimitSeconds, config.timeLimitSeconds);
  DOM.timerProgress.classList.remove('warning');
  startTimer();
  startClueTriggers();
}

// Shuffle interne pour les options
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function revealClue(idx) {
  const text = state.activeQuestion.clues[idx];
  if (!text) return;
  state.cluesShownCount = idx + 1;
  DOM.cluesContainer.querySelectorAll('.clue-item').forEach(c => c.classList.remove('active'));
  const el = document.createElement('div');
  el.className = 'clue-item active';
  el.innerHTML = `<span class="clue-label">Indice ${idx + 1}</span><p>${text}</p>`;
  DOM.cluesContainer.appendChild(el);
}

function startTimer() {
  clearInterval(state.timerIntervalId);
  DOM.gameTimerSeconds.textContent = state.timerSecondsRemaining;
  state.timerIntervalId = setInterval(() => {
    state.timerSecondsRemaining--;
    DOM.gameTimerSeconds.textContent = state.timerSecondsRemaining;
    updateTimerVisual(state.timerSecondsRemaining, config.timeLimitSeconds);
    if (state.timerSecondsRemaining <= 5) DOM.timerProgress.classList.add('warning');
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
  const base   = config.pointsPerQuestion - (300 * (cluesShown - 1));
  const factor = timeLeft / config.timeLimitSeconds;
  return Math.max(100, Math.round(base * (0.6 + 0.4 * factor)));
}

function handleAnswerSelect(selected, buttonEl) {
  stopQuestionIntervals();
  const isCorrect = selected === state.activeQuestion.correctAnswer;
  let pts = 0;

  DOM.optionsButtonsContainer.querySelectorAll('.btn-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === state.activeQuestion.correctAnswer) {
      btn.style.background = 'rgba(16,185,129,0.2)';
      btn.style.borderColor = 'var(--color-green)';
      btn.style.boxShadow   = '0 0 10px rgba(16,185,129,0.3)';
    } else if (btn === buttonEl && !isCorrect) {
      btn.style.background = 'rgba(239,68,68,0.2)';
      btn.style.borderColor = 'var(--color-red)';
      btn.style.boxShadow   = '0 0 10px rgba(239,68,68,0.3)';
      DOM.riddleTitle.classList.add('shake');
    }
  });

  if (isCorrect) {
    pts = calculateScore(state.timerSecondsRemaining, state.cluesShownCount);
    state.score += pts;
    DOM.gameScore.textContent = formatScore(state.score);
  }

  setTimeout(() => {
    DOM.riddleTitle.classList.remove('shake');
    DOM.feedbackOverlay.className = 'feedback-overlay';
    if (isCorrect) {
      DOM.feedbackOverlay.classList.add('correct');
      DOM.feedbackIcon.textContent       = '✅';
      DOM.feedbackTitle.textContent      = 'Bonne réponse !';
      DOM.feedbackTitle.style.color      = 'var(--color-green)';
      DOM.feedbackPoints.textContent     = `+${pts} pts`;
    } else {
      DOM.feedbackOverlay.classList.add('incorrect');
      DOM.feedbackIcon.textContent       = '❌';
      DOM.feedbackTitle.textContent      = 'Incorrect !';
      DOM.feedbackTitle.style.color      = 'var(--color-red)';
      DOM.feedbackPoints.textContent     = '0 pts';
    }
    DOM.feedbackText.innerHTML = `La bonne réponse était <strong>${state.activeQuestion.correctAnswer}</strong>.<br><br>💡 <em>${state.activeQuestion.funFact || ''}</em>`;
    DOM.feedbackOverlay.classList.add('active');
  }, 600);
}

function handleTimeOut() {
  stopQuestionIntervals();
  DOM.optionsButtonsContainer.querySelectorAll('.btn-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === state.activeQuestion.correctAnswer) {
      btn.style.background = 'rgba(16,185,129,0.2)';
      btn.style.borderColor = 'var(--color-green)';
    }
  });
  DOM.feedbackOverlay.className = 'feedback-overlay incorrect';
  DOM.feedbackIcon.textContent   = '⏰';
  DOM.feedbackTitle.textContent  = 'Temps écoulé !';
  DOM.feedbackTitle.style.color  = 'var(--color-red)';
  DOM.feedbackPoints.textContent = '0 pts';
  DOM.feedbackText.innerHTML     = `Vous avez manqué de temps. La bonne réponse était <strong>${state.activeQuestion.correctAnswer}</strong>.`;
  DOM.feedbackOverlay.classList.add('active');
}

function handleNextQuestion() {
  DOM.feedbackOverlay.classList.remove('active');
  const next = state.currentQuestionIndex + 1;
  if (next >= questionsList.length) { showRevelationVideo(); return; }
  loadQuestion(next);
}

// ==========================================================================
// VIDÉO RÉVÉLATION
// ==========================================================================
function showRevelationVideo() {
  showScreen('video');
  DOM.videoPlayOverlay.style.display = 'flex';
  const vType = config.revelationVideoType;
  const vId   = config.revelationVideoId;

  DOM.videoPlayerRevelation.style.display = 'none';
  DOM.ytPlayerRevelationPlaceholder.style.display = 'none';
  DOM.videoPlayerRevelation.pause();
  if (ytPlayerRevelation) { try { ytPlayerRevelation.destroy(); } catch(e){} ytPlayerRevelation = null; }

  const onEnded = () => {
    if (ytPlayerRevelation) { try { ytPlayerRevelation.destroy(); } catch(e){} ytPlayerRevelation = null; }
    showThemeRevelationScreen();
  };

  const play = () => {
    DOM.videoPlayOverlay.style.display = 'none';
    if (vType === "youtube") {
      ensureYTReady().then(() => {
        DOM.ytPlayerRevelationPlaceholder.style.display = 'block';
        ytPlayerRevelation = new YT.Player('yt-player-revelation', {
          height:'100%', width:'100%', videoId: vId,
          playerVars: { autoplay:1, controls:1, modestbranding:1, rel:0, playsinline:1 },
          events: {
            onReady: e => e.target.playVideo(),
            onStateChange: e => { if (e.data === YT.PlayerState.ENDED) onEnded(); }
          }
        });
      });
    } else {
      DOM.videoPlayerRevelation.style.display = 'block';
      DOM.videoPlayerRevelation.src = vId;
      DOM.videoPlayerRevelation.load();
      DOM.videoPlayerRevelation.play().catch(() => onEnded());
      DOM.videoPlayerRevelation.onended = onEnded;
    }
  };

  DOM.videoPlayOverlay.onclick = play;
  DOM.btnStartVideo.onclick    = e => { e.stopPropagation(); play(); };
  DOM.btnSkipVideo.onclick     = () => { if (vType==="direct") DOM.videoPlayerRevelation.pause(); onEnded(); };
}

// ==========================================================================
// ÉCRAN RÉVÉLATION THÈME
// ==========================================================================
function showThemeRevelationScreen() {
  DOM.revealedThemeText.textContent = config.themeToReveal || "🚀 SURPRISE 2026 🚀";
  showScreen('themeRevelation');
}

// ==========================================================================
// VIDÉO DE FIN
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
        height:'100%', width:'100%', videoId: vId,
        playerVars: { autoplay:1, controls:0, disablekb:1, fs:0, iv_load_policy:3, loop:1, playlist:vId, modestbranding:1, mute:1, rel:0, playsinline:1 },
        events: { onReady: e => { e.target.mute(); e.target.playVideo(); } }
      });
    });
  } else {
    DOM.videoPlayerEnding.style.display = 'block';
    DOM.videoPlayerEnding.src   = vId;
    DOM.videoPlayerEnding.muted = true;
    DOM.videoPlayerEnding.loop  = true;
    DOM.videoPlayerEnding.load();
    DOM.videoPlayerEnding.play().catch(()=>{});
  }
}

function stopEndingVideo() {
  if (config.endingVideoType === "direct") { DOM.videoPlayerEnding.pause(); }
  else if (ytPlayerEnding) { try { ytPlayerEnding.destroy(); } catch(e){} ytPlayerEnding = null; }
}

// ==========================================================================
// FIN DE JEU
// ==========================================================================
function endGame() {
  DOM.resultsPlayerName.textContent  = state.playerName;
  DOM.resultsFinalScore.textContent  = state.score;
  const max = questionsList.length * config.pointsPerQuestion;
  DOM.resultsRankTitle.textContent   = getRankBadge(state.score, max);
  showScreen('results');
  startEndingVideo();
  sendScore(state.playerName, state.score, () => renderLeaderboardView());
}

function shareScore() {
  const max   = questionsList.length * config.pointsPerQuestion;
  const badge = getRankBadge(state.score, max).split(' (')[0];
  const text  = `🕵️‍♂️ Super Mario Quiz — Édition Équipe\n👤 ${state.playerName}\n🏆 ${state.score} pts\n🏅 ${badge}\n🎮 Relevez le défi !`;
  navigator.clipboard.writeText(text)
    .then(() => {
      const orig = DOM.btnShareScore.innerHTML;
      DOM.btnShareScore.innerHTML = '<span>Copié ! ✓</span>';
      setTimeout(() => DOM.btnShareScore.innerHTML = orig, 2000);
    })
    .catch(() => alert("Score :\n\n" + text));
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  DOM.welcomeForm.addEventListener('submit', e => { e.preventDefault(); startPlay(); });
  DOM.btnNextQuestion.addEventListener('click', handleNextQuestion);
  DOM.btnShareScore.addEventListener('click', shareScore);
  DOM.btnGoToResults.addEventListener('click', endGame);
  DOM.btnRestartGame.addEventListener('click', () => { stopEndingVideo(); initGame(); });
  DOM.btnClearScores.addEventListener('click', () => {
    const mode = (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") ? "Google Sheets" : "Local Storage";
    if (confirm(`Réinitialiser tous les scores ? (${mode})`)) {
      if (mode === "Local Storage") { localStorage.removeItem('synapse_leaderboard'); renderLeaderboardView(); }
      else alert("Réinitialisation Google Sheets : à faire directement dans le fichier Sheets.");
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initGame();
});
