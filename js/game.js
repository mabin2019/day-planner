// Game Manager - Handles the word scramble game
class GameManager {
    constructor() {
        this.words = [
            { word: 'MOTIVATION', hint: 'The drive to achieve goals' },
            { word: 'SUCCESS', hint: 'Achievement of desired outcomes' },
            { word: 'DREAM', hint: 'An aspiration or ambition' },
            { word: 'FOCUS', hint: 'Concentrated attention' },
            { word: 'GROWTH', hint: 'Process of developing' },
            { word: 'COURAGE', hint: 'Bravery in facing challenges' },
            { word: 'WISDOM', hint: 'Knowledge gained through experience' },
            { word: 'PASSION', hint: 'Strong enthusiasm for something' },
            { word: 'ACHIEVE', hint: 'To successfully reach a goal' },
            { word: 'INSPIRE', hint: 'To fill with urge to do something' },
            { word: 'CREATE', hint: 'To bring something into existence' },
            { word: 'BELIEVE', hint: 'To have confidence in' },
            { word: 'STRENGTH', hint: 'Physical or mental power' },
            { word: 'CHALLENGE', hint: 'A demanding task or situation' },
            { word: 'OPPORTUNITY', hint: 'A chance for advancement' },
            { word: 'PERSISTENCE', hint: 'Continuing despite difficulties' },
            { word: 'EXCELLENCE', hint: 'Being outstanding in quality' },
            { word: 'PROGRESS', hint: 'Forward movement toward a goal' },
            { word: 'CONFIDENCE', hint: 'Belief in oneself' },
            { word: 'DETERMINATION', hint: 'Firmness of purpose' },
            { word: 'ADVENTURE', hint: 'An exciting experience' },
            { word: 'FREEDOM', hint: 'The state of being free' },
            { word: 'HAPPINESS', hint: 'A feeling of joy' },
            { word: 'KINDNESS', hint: 'Being friendly and considerate' },
            { word: 'LEARNING', hint: 'Acquiring knowledge or skills' },
            { word: 'PATIENCE', hint: 'Ability to wait calmly' },
            { word: 'RESPECT', hint: 'Admiration for someone' },
            { word: 'TEAMWORK', hint: 'Working together effectively' },
            { word: 'VICTORY', hint: 'Success in struggle or contest' },
            { word: 'WONDER', hint: 'Feeling of amazement' },
            { word: 'ENERGY', hint: 'Power and vitality' },
            { word: 'BALANCE', hint: 'State of equilibrium' },
            { word: 'CLARITY', hint: 'Quality of being clear' },
            { word: 'DISCIPLINE', hint: 'Training to act in accordance with rules' },
            { word: 'EMPATHY', hint: 'Understanding others\' feelings' },
            { word: 'FLEXIBILITY', hint: 'Ability to adapt to changes' },
            { word: 'GRATITUDE', hint: 'Feeling of thankfulness' },
            { word: 'HONESTY', hint: 'Quality of being truthful' },
            { word: 'INNOVATION', hint: 'Introduction of new ideas' },
            { word: 'JOURNEY', hint: 'A process of personal change' }
        ];

        this.gameState = {
            currentWord: null,
            scrambledWord: '',
            score: 0,
            timeLeft: 60,
            gameActive: false,
            wordsCompleted: 0,
            correctAnswers: 0,
            gameTimer: null,
            startTime: null
        };

        this.difficultyLevels = {
            easy: { timeBonus: 5, scoreMultiplier: 1, wordLength: [4, 6] },
            medium: { timeBonus: 3, scoreMultiplier: 1.5, wordLength: [5, 8] },
            hard: { timeBonus: 2, scoreMultiplier: 2, wordLength: [7, 12] }
        };

        this.currentDifficulty = 'medium';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGameData();
        this.updateHighScores();
    }

    setupEventListeners() {
        // Game control buttons
        const startGameBtn = document.getElementById('startGameBtn');
        const newWordBtn = document.getElementById('newWordBtn');
        const skipWordBtn = document.getElementById('skipWordBtn');
        const submitGuessBtn = document.getElementById('submitGuess');
        const guessInput = document.getElementById('guessInput');

        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame());
        }

        if (newWordBtn) {
            newWordBtn.addEventListener('click', () => this.getNewWord());
        }

        if (skipWordBtn) {
            skipWordBtn.addEventListener('click', () => this.skipWord());
        }

        if (submitGuessBtn) {
            submitGuessBtn.addEventListener('click', () => this.submitGuess());
        }

        if (guessInput) {
            guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitGuess();
                }
            });

            guessInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
    }

    startGame() {
        this.gameState = {
            currentWord: null,
            scrambledWord: '',
            score: 0,
            timeLeft: 60,
            gameActive: true,
            wordsCompleted: 0,
            correctAnswers: 0,
            gameTimer: null,
            startTime: Date.now()
        };

        this.updateGameUI();
        this.getNewWord();
        this.startTimer();
        this.updateGameControls();

        if (window.app) {
            window.app.showNotification('Game started! Good luck! 🎮', 'info');
        }
    }

    startTimer() {
        if (this.gameState.gameTimer) {
            clearInterval(this.gameState.gameTimer);
        }

        this.gameState.gameTimer = setInterval(() => {
            this.gameState.timeLeft--;
            this.updateTimer();

            if (this.gameState.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    getNewWord() {
        if (!this.gameState.gameActive) {
            if (window.app) {
                window.app.showNotification('Start a game first! 🎯', 'info');
            }
            return;
        }

        // Filter words based on difficulty
        const difficulty = this.difficultyLevels[this.currentDifficulty];
        const availableWords = this.words.filter(wordObj => {
            const length = wordObj.word.length;
            return length >= difficulty.wordLength[0] && length <= difficulty.wordLength[1];
        });

        // Get a random word that hasn't been used in this session
        const gameData = StorageManager.getGameData();
        const todayCompleted = gameData.dailyWordsCompleted || [];
        
        const unusedWords = availableWords.filter(wordObj => 
            !todayCompleted.includes(wordObj.word)
        );

        const wordsToChooseFrom = unusedWords.length > 0 ? unusedWords : availableWords;
        const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length);
        
        this.gameState.currentWord = wordsToChooseFrom[randomIndex];
        this.gameState.scrambledWord = this.scrambleWord(this.gameState.currentWord.word);

        this.updateWordDisplay();
        this.clearInput();
        this.clearFeedback();
    }

    scrambleWord(word) {
        const letters = word.split('');
        
        // Fisher-Yates shuffle algorithm
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        
        const scrambled = letters.join('');
        
        // Make sure the scrambled word is different from the original
        if (scrambled === word && word.length > 1) {
            return this.scrambleWord(word);
        }
        
        return scrambled;
    }

    submitGuess() {
        const guessInput = document.getElementById('guessInput');
        if (!guessInput || !this.gameState.gameActive || !this.gameState.currentWord) {
            return;
        }

        const guess = guessInput.value.trim().toUpperCase();
        if (!guess) {
            this.showFeedback('Please enter a guess!', 'error');
            return;
        }

        const correctWord = this.gameState.currentWord.word;
        
        if (guess === correctWord) {
            this.handleCorrectGuess();
        } else {
            this.handleIncorrectGuess(guess);
        }
    }

    handleCorrectGuess() {
        const points = this.calculatePoints();
        this.gameState.score += points;
        this.gameState.correctAnswers++;
        this.gameState.wordsCompleted++;

        // Add to completed words for today
        const gameData = StorageManager.getGameData();
        if (!gameData.dailyWordsCompleted.includes(this.gameState.currentWord.word)) {
            gameData.dailyWordsCompleted.push(this.gameState.currentWord.word);
            StorageManager.saveGameData(gameData);
        }

        this.showFeedback(`Correct! +${points} points! 🎉`, 'success');
        this.updateGameUI();

        // Add bonus time for correct answer
        const bonus = this.difficultyLevels[this.currentDifficulty].timeBonus;
        this.gameState.timeLeft += bonus;

        setTimeout(() => {
            this.getNewWord();
        }, 1500);
    }

    handleIncorrectGuess(guess) {
        this.showFeedback(`"${guess}" is not correct. Try again! 🤔`, 'error');
    }

    calculatePoints() {
        const basePoints = this.gameState.currentWord.word.length * 10;
        const timeBonus = Math.max(0, this.gameState.timeLeft - 30) * 2;
        const difficultyMultiplier = this.difficultyLevels[this.currentDifficulty].scoreMultiplier;
        
        return Math.round((basePoints + timeBonus) * difficultyMultiplier);
    }

    skipWord() {
        if (!this.gameState.gameActive) {
            return;
        }

        const penalty = 5;
        this.gameState.timeLeft = Math.max(0, this.gameState.timeLeft - penalty);
        
        this.showFeedback(`Word skipped! -${penalty} seconds ⏰`, 'error');
        
        setTimeout(() => {
            this.getNewWord();
        }, 1000);
    }

    endGame() {
        this.gameState.gameActive = false;
        
        if (this.gameState.gameTimer) {
            clearInterval(this.gameState.gameTimer);
        }

        this.saveGameResults();
        this.updateGameControls();
        this.showGameSummary();
    }

    saveGameResults() {
        const gameData = StorageManager.getGameData();
        
        // Update today's score if it's higher
        if (this.gameState.score > gameData.todayScore) {
            gameData.todayScore = this.gameState.score;
        }

        gameData.totalGamesPlayed++;
        
        // Add to high scores if score is good enough
        if (this.gameState.score > 0) {
            StorageManager.addHighScore(this.gameState.score, this.gameState.correctAnswers);
        }

        StorageManager.saveGameData(gameData);
    }

    showGameSummary() {
        const accuracy = this.gameState.wordsCompleted > 0 
            ? Math.round((this.gameState.correctAnswers / this.gameState.wordsCompleted) * 100)
            : 0;

        const summary = `
            Game Over! 🎮
            
            Final Score: ${this.gameState.score}
            Words Completed: ${this.gameState.correctAnswers}
            Accuracy: ${accuracy}%
        `;

        this.showFeedback(summary, 'info');
        
        if (window.app) {
            let message = `Game finished! Score: ${this.gameState.score} 🏆`;
            if (this.gameState.score > 0) {
                message += ' Great job!';
            }
            window.app.showNotification(message, 'success', 5000);
        }

        this.updateHighScores();
    }

    updateWordDisplay() {
        const scrambledWordElement = document.getElementById('scrambledWord');
        const wordHintElement = document.getElementById('wordHint');
        
        if (scrambledWordElement && this.gameState.currentWord) {
            scrambledWordElement.textContent = this.gameState.scrambledWord;
        }
        
        if (wordHintElement && this.gameState.currentWord) {
            wordHintElement.textContent = `Hint: ${this.gameState.currentWord.hint}`;
        }
    }

    updateGameUI() {
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) {
            scoreElement.textContent = this.gameState.score;
        }
    }

    updateTimer() {
        const timerElement = document.getElementById('gameTimer');
        if (timerElement) {
            timerElement.textContent = this.gameState.timeLeft;
            
            // Change color when time is running low
            if (this.gameState.timeLeft <= 10) {
                timerElement.style.color = '#ef4444';
            } else if (this.gameState.timeLeft <= 30) {
                timerElement.style.color = '#f59e0b';
            } else {
                timerElement.style.color = '#6b7280';
            }
        }
    }

    updateGameControls() {
        const startBtn = document.getElementById('startGameBtn');
        const newWordBtn = document.getElementById('newWordBtn');
        const skipWordBtn = document.getElementById('skipWordBtn');
        const submitBtn = document.getElementById('submitGuess');
        const guessInput = document.getElementById('guessInput');

        if (this.gameState.gameActive) {
            if (startBtn) startBtn.textContent = 'Game Active';
            if (startBtn) startBtn.disabled = true;
            if (newWordBtn) newWordBtn.disabled = false;
            if (skipWordBtn) skipWordBtn.disabled = false;
            if (submitBtn) submitBtn.disabled = false;
            if (guessInput) guessInput.disabled = false;
        } else {
            if (startBtn) startBtn.textContent = 'Start Game';
            if (startBtn) startBtn.disabled = false;
            if (newWordBtn) newWordBtn.disabled = true;
            if (skipWordBtn) skipWordBtn.disabled = true;
            if (submitBtn) submitBtn.disabled = true;
            if (guessInput) guessInput.disabled = true;
        }
    }

    updateHighScores() {
        const gameData = StorageManager.getGameData();
        const highScoresList = document.getElementById('highScoresList');
        
        if (!highScoresList) return;

        if (gameData.highScores.length === 0) {
            highScoresList.innerHTML = '<p style="text-align: center; color: #6b7280;">No high scores yet. Play a game to get started!</p>';
            return;
        }

        const scoresHTML = gameData.highScores.slice(0, 5).map((score, index) => {
            const date = new Date(score.date).toLocaleDateString();
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            
            return `
                <div class="score-item">
                    <span>${medal} ${score.score} pts</span>
                    <span>${score.wordsCompleted} words • ${date}</span>
                </div>
            `;
        }).join('');

        highScoresList.innerHTML = scoresHTML;
    }

    showFeedback(message, type) {
        const feedbackElement = document.getElementById('gameFeedback');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `game-feedback ${type}`;
        }
    }

    clearFeedback() {
        const feedbackElement = document.getElementById('gameFeedback');
        if (feedbackElement) {
            feedbackElement.textContent = '';
            feedbackElement.className = 'game-feedback';
        }
    }

    clearInput() {
        const guessInput = document.getElementById('guessInput');
        if (guessInput) {
            guessInput.value = '';
            guessInput.focus();
        }
    }

    loadGameData() {
        const gameData = StorageManager.getGameData();
        this.gameState.score = 0; // Always start fresh for new game
        
        // Update UI with stored data
        this.updateGameUI();
        this.updateTimer();
    }

    // Difficulty management
    setDifficulty(level) {
        if (this.difficultyLevels[level]) {
            this.currentDifficulty = level;
            if (window.app) {
                window.app.showNotification(`Difficulty set to ${level}! 🎯`, 'info');
            }
        }
    }

    // Get hint for current word
    getHint() {
        if (!this.gameState.currentWord) return;
        
        const word = this.gameState.currentWord.word;
        const hintLength = Math.ceil(word.length / 3);
        const revealedPositions = [];
        
        // Randomly select positions to reveal
        while (revealedPositions.length < hintLength) {
            const pos = Math.floor(Math.random() * word.length);
            if (!revealedPositions.includes(pos)) {
                revealedPositions.push(pos);
            }
        }
        
        let hint = '_'.repeat(word.length).split('');
        revealedPositions.forEach(pos => {
            hint[pos] = word[pos];
        });
        
        this.showFeedback(`Letter hint: ${hint.join(' ')} 💡`, 'info');
        
        // Small time penalty for using hint
        this.gameState.timeLeft = Math.max(0, this.gameState.timeLeft - 3);
    }

    // Pause/Resume game
    pauseGame() {
        if (this.gameState.gameActive && this.gameState.gameTimer) {
            clearInterval(this.gameState.gameTimer);
            this.gameState.gameTimer = null;
            this.showFeedback('Game paused ⏸️', 'info');
        }
    }

    resumeGame() {
        if (this.gameState.gameActive && !this.gameState.gameTimer) {
            this.startTimer();
            this.showFeedback('Game resumed ▶️', 'info');
        }
    }
}

// Initialize game manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}