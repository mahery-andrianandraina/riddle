// Logique du jeu - Qui Suis-je ? - Édition Équipe
// Fonctionne en protocole local (file://) sans serveur requis.

// ==========================================================================
// ACCÈS AUX DONNÉES GLOBALES
// ==========================================================================
const gameData = window.gameData;
const config = gameData.settings;
const questionsList = gameData.questions;

// ==========================================================================
// ÉTAT DU JEU (STATE)
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

// Références de lecteurs vidéo YouTube
let ytPlayerRevelation = null;
let ytPlayerEnding = null;

// ==========================================================================
// ÉLÉMENTS DOM
// ==========================================================================
const DOM = {
  // Écrans
  screens: {
    welcome: document.getElementById('screen-welcome'),
    game: document.getElementById('screen-game'),
    video: document.getElementById('screen-video'),
    themeRevelation: document.getElementById('screen-theme-revelation'),
    results: document.getElementById('screen-results')
  },
  
  // Formulaire d'accueil
  welcomeForm: document.getElementById('welcome-form'),
  playerNameInput: document.getElementById('player-name-input'),
  
  // Écran de jeu
  gamePlayerName: document.getElementById('game-player-name'),
  gameScore: document.getElementById('game-score'),
  gameTimerSeconds: document.getElementById('game-timer-seconds'),
  timerProgress: document.getElementById('timer-progress'),
  gameProgressFill: document.getElementById('game-progress-fill'),
  gameQuestionNumber: document.getElementById('game-question-number'),
  gameQuestionCategory: document.getElementById('game-question-category'),
  riddleTitle: document.getElementById('riddle-title'),
  cluesContainer: document.getElementById('clues-container'),
  optionsButtonsContainer: document.getElementById('options-buttons-container'),
  
  // Overlay de Feedback
  feedbackOverlay: document.getElementById('feedback-overlay'),
  feedbackIcon: document.getElementById('feedback-icon'),
  feedbackTitle: document.getElementById('feedback-title'),
  feedbackText: document.getElementById('feedback-text'),
  feedbackPoints: document.getElementById('feedback-points'),
  btnNextQuestion: document.getElementById('btn-next-question'),
  
  // Écran vidéo de Révélation
  videoPlayerRevelation: document.getElementById('video-player-revelation'),
  ytPlayerRevelationPlaceholder: document.getElementById('yt-player-revelation'),
  btnSkipVideo: document.getElementById('btn-skip-video'),
  videoPlayOverlay: document.getElementById('video-play-overlay'),
  btnStartVideo: document.getElementById('btn-start-video'),
  
  // Écran de révélation de thème
  revealedThemeText: document.getElementById('revealed-theme-text'),
  btnGoToResults: document.getElementById('btn-go-to-results'),
  
  // Écran de résultats
  resultsPlayerName: document.getElementById('results-player-name'),
  resultsFinalScore: document.getElementById('results-final-score'),
  resultsRankTitle: document.getElementById('results-rank-title'),
  btnShareScore: document.getElementById('btn-share-score'),
  btnRestartGame: document.getElementById('btn-restart-game'),
  videoPlayerEnding: document.getElementById('video-player-ending'),
  ytPlayerEndingPlaceholder: document.getElementById('yt-player-ending'),
  
  // Classement
  leaderboardTbody: document.getElementById('leaderboard-tbody'),
  btnClearScores: document.getElementById('btn-clear-scores')
};

// Chargement de l'API YouTube IFrame Player (chargé dynamiquement)
if (!window.YT) {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Promesse pour s'assurer que l'API YouTube est prête
function ensureYTReady() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      // Timeout de sécurité après 4s
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 4000);
    }
  });
}

// ==========================================================================
// NAVIGATION & UTILITAIRES
// ==========================================================================

function showScreen(screenKey) {
  Object.values(DOM.screens).forEach(screen => {
    if (screen) {
      screen.classList.remove('active');
    }
  });
  
  const targetScreen = DOM.screens[screenKey];
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

function formatScore(num) {
  return String(num).padStart(4, '0');
}

function getRankBadge(score, maxPossibleScore) {
  const ratio = score / maxPossibleScore;
  if (ratio >= 0.85) return "Détective d'Or 🕵️‍♂️ (Légendaire)";
  if (ratio >= 0.60) return "Agent Spécial 🕵️ (Excellent)";
  if (ratio >= 0.35) return "Enquêteur Junior 🧐 (Pas mal)";
  return "Stagiaire Perdu 🤷‍♂️ (Peut mieux faire)";
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================================================
// GESTION DU CLASSEMENT (LOCAL & GOOGLE SHEETS)
// ==========================================================================

// Récupère les scores
function loadLeaderboard(callback) {
  if (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") {
    // Mode Google Sheets
    fetch(config.googleSheetsUrl)
      .then(res => res.json())
      .then(data => {
        state.leaderboard = data;
        if (callback) callback(data);
      })
      .catch(err => {
        console.warn("Erreur Google Sheets, bascule sur le stockage local :", err);
        loadLocalLeaderboard(callback);
      });
  } else {
    // Mode Local
    loadLocalLeaderboard(callback);
  }
}

function loadLocalLeaderboard(callback) {
  const stored = localStorage.getItem('synapse_leaderboard');
  state.leaderboard = stored ? JSON.parse(stored) : [];
  if (callback) callback(state.leaderboard);
}

// Envoie un score
function sendScore(playerName, score, callback) {
  if (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") {
    // Mode Google Sheets
    const payload = {
      playerName: playerName,
      score: score
    };
    
    fetch(config.googleSheetsUrl, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(payload)
    })
      .then(() => {
        loadLeaderboard(callback);
      })
      .catch(err => {
        console.warn("Erreur d'envoi Google Sheets, enregistrement en local :", err);
        saveScoreLocal(playerName, score, callback);
      });
  } else {
    // Mode Local
    saveScoreLocal(playerName, score, callback);
  }
}

function saveScoreLocal(playerName, score, callback) {
  loadLocalLeaderboard(() => {
    const newEntry = {
      playerName: playerName,
      score: score,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    };
    
    state.leaderboard.push(newEntry);
    state.leaderboard.sort((a, b) => b.score - a.score);
    state.leaderboard = state.leaderboard.slice(0, 10);
    
    localStorage.setItem('synapse_leaderboard', JSON.stringify(state.leaderboard));
    if (callback) callback(state.leaderboard);
  });
}

// Rendu HTML du classement
function renderLeaderboardView() {
  DOM.leaderboardTbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
        Chargement du classement...
      </td>
    </tr>
  `;
  
  loadLeaderboard((list) => {
    DOM.leaderboardTbody.innerHTML = '';
    
    if (!list || list.length === 0) {
      DOM.leaderboardTbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            Aucun score pour le moment. Soyez le premier !
          </td>
        </tr>
      `;
      return;
    }
    
    list.forEach((entry, idx) => {
      const row = document.createElement('tr');
      let rankDisplay = idx + 1;
      if (idx === 0) rankDisplay = '🥇';
      else if (idx === 1) rankDisplay = '🥈';
      else if (idx === 2) rankDisplay = '🥉';
      
      row.innerHTML = `
        <td>${rankDisplay}</td>
        <td style="font-weight: 500; color: var(--text-primary);">${escapeHTML(entry.playerName)}</td>
        <td style="font-family: var(--font-title); font-weight: 700; color: var(--color-cyan);">${entry.score} pts</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${entry.date || 'Récemment'}</td>
      `;
      DOM.leaderboardTbody.appendChild(row);
    });
  });
}

// ==========================================================================
// MOTEUR DE JEU
// ==========================================================================

function initGame() {
  state.score = 0;
  state.currentQuestionIndex = 0;
  DOM.gameScore.textContent = formatScore(0);
  showScreen('welcome');
  renderLeaderboardView();
}

function startPlay() {
  const nameInput = DOM.playerNameInput.value.trim();
  state.playerName = nameInput || 'Anonyme';
  DOM.gamePlayerName.textContent = state.playerName;
  
  showScreen('game');
  loadQuestion(0);
}

function loadQuestion(index) {
  state.currentQuestionIndex = index;
  state.activeQuestion = questionsList[index];
  state.cluesShownCount = 1;
  state.timerSecondsRemaining = config.timeLimitSeconds;
  
  // Barre de progression
  const progressPercent = ((index) / questionsList.length) * 100;
  DOM.gameProgressFill.style.width = `${progressPercent}%`;
  DOM.gameQuestionNumber.textContent = `Question ${index + 1} sur ${questionsList.length}`;
  
  // Catégorie
  let catEmoji = "❓";
  if (state.activeQuestion.category === "coworker") catEmoji = "👤 Collègue";
  else if (state.activeQuestion.category === "tool") catEmoji = "🔧 Outil";
  else if (state.activeQuestion.category === "office-life") catEmoji = "🏢 Vie de Bureau";
  
  DOM.gameQuestionCategory.textContent = catEmoji;
  DOM.riddleTitle.textContent = state.activeQuestion.title || "Qui suis-je ?";
  
  DOM.cluesContainer.innerHTML = '';
  
  // Options
  const options = state.activeQuestion.options;
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

function revealClue(clueIndex) {
  const clueText = state.activeQuestion.clues[clueIndex];
  if (!clueText) return;
  
  state.cluesShownCount = clueIndex + 1;
  
  const currentClues = DOM.cluesContainer.querySelectorAll('.clue-item');
  currentClues.forEach(c => c.classList.remove('active'));
  
  const clueElement = document.createElement('div');
  clueElement.className = 'clue-item active';
  clueElement.innerHTML = `
    <span class="clue-label">Indice ${clueIndex + 1}</span>
    <p>${clueText}</p>
  `;
  DOM.cluesContainer.appendChild(clueElement);
}

function startTimer() {
  clearInterval(state.timerIntervalId);
  DOM.gameTimerSeconds.textContent = state.timerSecondsRemaining;
  
  state.timerIntervalId = setInterval(() => {
    state.timerSecondsRemaining--;
    DOM.gameTimerSeconds.textContent = state.timerSecondsRemaining;
    
    updateTimerVisual(state.timerSecondsRemaining, config.timeLimitSeconds);
    
    if (state.timerSecondsRemaining <= 5) {
      DOM.timerProgress.classList.add('warning');
    }
    
    if (state.timerSecondsRemaining <= 0) {
      handleTimeOut();
    }
  }, 1000);
}

function startClueTriggers() {
  clearInterval(state.clueIntervalId);
  const delay = Math.floor(config.timeLimitSeconds / 3);
  
  state.clueIntervalId = setInterval(() => {
    const nextClueIndex = state.cluesShownCount;
    const triggerTime = config.timeLimitSeconds - (nextClueIndex * delay);
    
    if (state.timerSecondsRemaining <= triggerTime) {
      if (nextClueIndex < state.activeQuestion.clues.length) {
        revealClue(nextClueIndex);
      } else {
        clearInterval(state.clueIntervalId);
      }
    }
  }, 250);
}

function updateTimerVisual(value, max) {
  const radius = 15.9155;
  const pct = (value / max) * 100;
  const strokeDash = `${pct}, 100`;
  DOM.timerProgress.setAttribute('stroke-dasharray', strokeDash);
}

// Arrêter les intervals de temps de question
function stopQuestionIntervals() {
  clearInterval(state.timerIntervalId);
  clearInterval(state.clueIntervalId);
}

function calculateScore(timeRemaining, cluesShown) {
  const basePoints = config.pointsPerQuestion - (300 * (cluesShown - 1));
  const timeFactor = timeRemaining / config.timeLimitSeconds;
  const points = Math.round(basePoints * (0.6 + 0.4 * timeFactor));
  return Math.max(100, points);
}

function handleAnswerSelect(selectedAnswer, buttonElement) {
  stopQuestionIntervals();
  
  const isCorrect = (selectedAnswer === state.activeQuestion.correctAnswer);
  let earnedPoints = 0;
  
  const buttons = DOM.optionsButtonsContainer.querySelectorAll('.btn-option');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === state.activeQuestion.correctAnswer) {
      btn.style.background = 'rgba(16, 185, 129, 0.2)';
      btn.style.borderColor = 'var(--color-green)';
      btn.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
    } else if (btn === buttonElement && !isCorrect) {
      btn.style.background = 'rgba(239, 68, 68, 0.2)';
      btn.style.borderColor = 'var(--color-red)';
      btn.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.3)';
      DOM.riddleTitle.classList.add('shake');
    }
  });

  if (isCorrect) {
    earnedPoints = calculateScore(state.timerSecondsRemaining, state.cluesShownCount);
    state.score += earnedPoints;
    DOM.gameScore.textContent = formatScore(state.score);
  }

  setTimeout(() => {
    DOM.riddleTitle.classList.remove('shake');
    DOM.feedbackOverlay.className = 'feedback-overlay';
    
    if (isCorrect) {
      DOM.feedbackOverlay.classList.add('correct');
      DOM.feedbackIcon.textContent = '✅';
      DOM.feedbackTitle.textContent = 'Bonne réponse !';
      DOM.feedbackTitle.style.color = 'var(--color-green)';
      DOM.feedbackPoints.textContent = `+${earnedPoints} pts`;
    } else {
      DOM.feedbackOverlay.classList.add('incorrect');
      DOM.feedbackIcon.textContent = '❌';
      DOM.feedbackTitle.textContent = 'Incorrect !';
      DOM.feedbackTitle.style.color = 'var(--color-red)';
      DOM.feedbackPoints.textContent = '0 pts';
    }
    
    DOM.feedbackText.innerHTML = `La bonne réponse était <strong>${state.activeQuestion.correctAnswer}</strong>.<br><br>💡 <em>${state.activeQuestion.funFact || ''}</em>`;
    DOM.feedbackOverlay.classList.add('active');
  }, 600);
}

function handleTimeOut() {
  stopQuestionIntervals();
  
  const buttons = DOM.optionsButtonsContainer.querySelectorAll('.btn-option');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === state.activeQuestion.correctAnswer) {
      btn.style.background = 'rgba(16, 185, 129, 0.2)';
      btn.style.borderColor = 'var(--color-green)';
    }
  });
  
  DOM.feedbackOverlay.className = 'feedback-overlay incorrect';
  DOM.feedbackIcon.textContent = '⏰';
  DOM.feedbackTitle.textContent = 'Temps écoulé !';
  DOM.feedbackTitle.style.color = 'var(--color-red)';
  DOM.feedbackPoints.textContent = '0 pts';
  DOM.feedbackText.innerHTML = `Vous avez manqué de temps. La bonne réponse était <strong>${state.activeQuestion.correctAnswer}</strong>.`;
  DOM.feedbackOverlay.classList.add('active');
}

function handleNextQuestion() {
  DOM.feedbackOverlay.classList.remove('active');
  const nextIndex = state.currentQuestionIndex + 1;
  
  // Si on a terminé toutes les devinettes
  if (nextIndex >= questionsList.length) {
    showRevelationVideo();
    return;
  }
  
  loadQuestion(nextIndex);
}

// ==========================================================================
// GESTION DE LA VIDÉO DE RÉVÉLATION (JOUÉE À LA FIN DU JEU)
// ==========================================================================

function showRevelationVideo() {
  showScreen('video');
  DOM.videoPlayOverlay.style.display = 'flex';
  
  const vType = config.revelationVideoType;
  const vId = config.revelationVideoId;

  DOM.videoPlayerRevelation.style.display = 'none';
  DOM.ytPlayerRevelationPlaceholder.style.display = 'none';
  DOM.videoPlayerRevelation.pause();
  
  if (ytPlayerRevelation) {
    try { ytPlayerRevelation.destroy(); } catch(e) {}
    ytPlayerRevelation = null;
  }

  // Callback de transition après la vidéo
  const onVideoEnded = () => {
    if (ytPlayerRevelation) {
      try { ytPlayerRevelation.destroy(); } catch(e) {}
      ytPlayerRevelation = null;
    }
    showThemeRevelationScreen();
  };

  const playVideoAction = () => {
    DOM.videoPlayOverlay.style.display = 'none';
    
    if (vType === "youtube") {
      ensureYTReady().then(() => {
        DOM.ytPlayerRevelationPlaceholder.style.display = 'block';
        ytPlayerRevelation = new YT.Player('yt-player-revelation', {
          height: '100%',
          width: '100%',
          videoId: vId,
          playerVars: {
            'autoplay': 1,
            'controls': 1,
            'modestbranding': 1,
            'rel': 0,
            'playsinline': 1
          },
          events: {
            'onReady': (event) => {
              event.target.playVideo();
            },
            'onStateChange': (event) => {
              if (event.data === YT.PlayerState.ENDED) {
                onVideoEnded();
              }
            }
          }
        });
      });
    } else {
      // Direct MP4
      DOM.videoPlayerRevelation.style.display = 'block';
      DOM.videoPlayerRevelation.src = vId;
      DOM.videoPlayerRevelation.load();
      DOM.videoPlayerRevelation.play().catch(err => {
        console.warn("Échec play direct :", err);
        onVideoEnded();
      });
      DOM.videoPlayerRevelation.onended = onVideoEnded;
    }
  };

  DOM.videoPlayOverlay.onclick = playVideoAction;
  DOM.btnStartVideo.onclick = (e) => {
    e.stopPropagation();
    playVideoAction();
  };

  DOM.btnSkipVideo.onclick = () => {
    if (vType === "direct") {
      DOM.videoPlayerRevelation.pause();
    }
    onVideoEnded();
  };
}

// ==========================================================================
// ÉCRAN DE RÉVÉLATION DU THÈME (APRÈS VIDÉO)
// ==========================================================================

function showThemeRevelationScreen() {
  // Injecter le thème depuis game-data
  DOM.revealedThemeText.textContent = config.themeToReveal || "🚀 HACKATHON SPÉCIAL ÉQUIPE 🚀";
  showScreen('themeRevelation');
}

// ==========================================================================
// VIDÉO DE FIN (LEADERBOARD BACKGROUND LOOP)
// ==========================================================================

function startEndingVideo() {
  const vType = config.endingVideoType;
  const vId = config.endingVideoId;

  DOM.videoPlayerEnding.style.display = 'none';
  DOM.ytPlayerEndingPlaceholder.style.display = 'none';
  DOM.videoPlayerEnding.pause();
  
  if (ytPlayerEnding) {
    try { ytPlayerEnding.destroy(); } catch(e) {}
    ytPlayerEnding = null;
  }

  if (vType === "youtube") {
    ensureYTReady().then(() => {
      DOM.ytPlayerEndingPlaceholder.style.display = 'block';
      ytPlayerEnding = new YT.Player('yt-player-ending', {
        height: '100%',
        width: '100%',
        videoId: vId,
        playerVars: {
          'autoplay': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'iv_load_policy': 3,
          'loop': 1,
          'playlist': vId,
          'modestbranding': 1,
          'mute': 1,
          'rel': 0,
          'playsinline': 1
        },
        events: {
          'onReady': (event) => {
            event.target.mute();
            event.target.playVideo();
          }
        }
      });
    });
  } else {
    // Direct MP4
    DOM.videoPlayerEnding.style.display = 'block';
    DOM.videoPlayerEnding.src = vId;
    DOM.videoPlayerEnding.muted = true;
    DOM.videoPlayerEnding.loop = true;
    DOM.videoPlayerEnding.load();
    DOM.videoPlayerEnding.play().catch(e => console.log("Muted autoplay blocked", e));
  }
}

function stopEndingVideo() {
  if (config.endingVideoType === "direct") {
    DOM.videoPlayerEnding.pause();
  } else if (ytPlayerEnding) {
    try { ytPlayerEnding.destroy(); } catch(e) {}
    ytPlayerEnding = null;
  }
}

// ==========================================================================
// FIN DE JEU & ÉCRAN RÉSULTATS (LEADERBOARD)
// ==========================================================================

function endGame() {
  DOM.resultsPlayerName.textContent = state.playerName;
  DOM.resultsFinalScore.textContent = state.score;
  
  const maxScore = questionsList.length * config.pointsPerQuestion;
  DOM.resultsRankTitle.textContent = getRankBadge(state.score, maxScore);
  
  showScreen('results');
  startEndingVideo();
  
  // Envoi du score à Google Sheets (ou local de secours) et affichage du tableau des scores
  sendScore(state.playerName, state.score, () => {
    renderLeaderboardView();
  });
}

function shareScore() {
  const maxScore = questionsList.length * config.pointsPerQuestion;
  const badge = getRankBadge(state.score, maxScore).split(' (')[0];
  
  const shareText = `🕵️‍♂️ Synapse "Qui suis-je ?" - Édition Équipe\n👤 Joueur : ${state.playerName}\n🏆 Score : ${state.score} pts\n🏅 Rang : ${badge}\n🎮 Relevez le défi !`;
  
  navigator.clipboard.writeText(shareText)
    .then(() => {
      const originalText = DOM.btnShareScore.innerHTML;
      DOM.btnShareScore.innerHTML = '<span>Copié ! ✓</span>';
      setTimeout(() => {
        DOM.btnShareScore.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      alert("Impossible de copier automatiquement. Voici votre score :\n\n" + shareText);
    });
}

// ==========================================================================
// INITIALISATION DES ÉCOUTEURS D'ÉVÉNEMENTS
// ==========================================================================

function setupEventListeners() {
  DOM.welcomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    startPlay();
  });
  
  DOM.btnNextQuestion.addEventListener('click', handleNextQuestion);
  DOM.btnShareScore.addEventListener('click', shareScore);
  
  // Liaison du clic sur l'écran de révélation vers la page de résultats
  DOM.btnGoToResults.addEventListener('click', () => {
    endGame();
  });
  
  DOM.btnRestartGame.addEventListener('click', () => {
    stopEndingVideo();
    initGame();
  });
  
  DOM.btnClearScores.addEventListener('click', () => {
    const storageMode = (config.googleSheetsUrl && config.googleSheetsUrl.trim() !== "") ? "Google Sheets (si autorisé)" : "Local Storage";
    if (confirm(`Voulez-vous vraiment réinitialiser les scores ? (Action appliquée au stockage actif : ${storageMode})`)) {
      if (storageMode === "Local Storage") {
        localStorage.removeItem('synapse_leaderboard');
        renderLeaderboardView();
      } else {
        alert("La réinitialisation globale du Google Sheet doit être effectuée directement dans le fichier Sheets par l'administrateur.");
      }
    }
  });
}

// Lancement au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initGame();
});
