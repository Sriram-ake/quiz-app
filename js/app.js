/**
 * QuizMaster Pro Application Controller
 * Handles quiz lifecycle, 20-second countdown timer, choice evaluations,
 * explanation reveals, and question-by-question review presentation.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { QuizEngine, QUESTION_BANK } = window.QuizEngine;
  const engine = new QuizEngine(QUESTION_BANK);

  // Timer Configuration
  const QUESTION_TIME_SECONDS = 20;
  let remainingTime = QUESTION_TIME_SECONDS;
  let timerInterval = null;

  // DOM Elements
  const categorySelect = document.getElementById('categorySelect');
  const quizArena = document.getElementById('quizArena');
  const resultsArena = document.getElementById('resultsArena');

  const questionCategory = document.getElementById('questionCategory');
  const questionProgress = document.getElementById('questionProgress');
  const timerSeconds = document.getElementById('timerSeconds');
  const timerBar = document.getElementById('timerBar');

  const questionPrompt = document.getElementById('questionPrompt');
  const optionsList = document.getElementById('optionsList');
  const explanationBox = document.getElementById('explanationBox');
  const explanationText = document.getElementById('explanationText');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');

  // Results Screen Elements
  const scorePercent = document.getElementById('scorePercent');
  const scoreFraction = document.getElementById('scoreFraction');
  const resultsGrade = document.getElementById('resultsGrade');
  const resultsMsg = document.getElementById('resultsMsg');
  const restartBtn = document.getElementById('restartBtn');
  const reviewList = document.getElementById('reviewList');

  function startQuizSession() {
    const category = categorySelect.value;
    engine.startQuiz(category, 5);

    resultsArena.classList.add('hidden');
    quizArena.classList.remove('hidden');

    loadActiveQuestion();
  }

  function startTimer() {
    clearInterval(timerInterval);
    remainingTime = QUESTION_TIME_SECONDS;
    timerSeconds.textContent = remainingTime;
    timerBar.style.width = '100%';

    timerInterval = setInterval(() => {
      remainingTime -= 1;
      timerSeconds.textContent = Math.max(0, remainingTime);

      const percent = (remainingTime / QUESTION_TIME_SECONDS) * 100;
      timerBar.style.width = `${percent}%`;

      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function loadActiveQuestion() {
    const current = engine.getCurrentQuestion();
    if (!current) {
      showResults();
      return;
    }

    const { question, index, total } = current;

    // Header info
    questionCategory.textContent = question.category;
    questionProgress.textContent = `Question ${index + 1} of ${total}`;
    questionPrompt.textContent = question.question;

    // Reset explanation & button
    explanationBox.classList.add('hidden');
    nextQuestionBtn.classList.add('hidden');
    nextQuestionBtn.textContent = index === total - 1 ? 'Complete Challenge ›' : 'Next Question ›';

    // Render 4 options
    const letters = ['A', 'B', 'C', 'D'];
    optionsList.innerHTML = question.options.map((opt, i) => `
      <button class="option-btn" data-index="${i}">
        <span class="option-letter">${letters[i]}</span>
        <span class="option-text">${escapeHtml(opt)}</span>
      </button>
    `).join('');

    optionsList.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        handleAnswer(idx);
      });
    });

    startTimer();
  }

  function handleAnswer(selectedIndex) {
    stopTimer();

    const evaluation = engine.submitAnswer(selectedIndex);
    if (!evaluation) return;

    // Freeze all option buttons
    optionsList.querySelectorAll('.option-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === evaluation.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex && !evaluation.isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    // Reveal explanation
    explanationText.textContent = evaluation.explanation;
    explanationBox.classList.remove('hidden');
    nextQuestionBtn.classList.remove('hidden');
    nextQuestionBtn.focus();
  }

  function handleTimeout() {
    // Time expired: auto-fail question (-1)
    const evaluation = engine.submitAnswer(-1);

    optionsList.querySelectorAll('.option-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === evaluation.correctIndex) {
        btn.classList.add('correct');
      }
    });

    explanationText.textContent = `Time expired! ${evaluation.explanation}`;
    explanationBox.classList.remove('hidden');
    nextQuestionBtn.classList.remove('hidden');
    nextQuestionBtn.focus();
  }

  nextQuestionBtn.addEventListener('click', () => {
    engine.nextQuestion();
    if (engine.isCompleted) {
      showResults();
    } else {
      loadActiveQuestion();
    }
  });

  function showResults() {
    stopTimer();
    quizArena.classList.add('hidden');
    resultsArena.classList.remove('hidden');

    const results = engine.getResults();
    scorePercent.textContent = `${results.percent}%`;
    scoreFraction.textContent = `${results.correct} of ${results.total} Correct`;
    resultsGrade.textContent = results.grade;

    if (results.percent >= 80) {
      resultsMsg.textContent = 'Outstanding mastery of advanced software engineering and architectural concepts!';
    } else if (results.percent >= 50) {
      resultsMsg.textContent = 'Solid baseline knowledge. Review the architectural insights below to sharpen key principles.';
    } else {
      resultsMsg.textContent = 'Good practice session. Carefully examine the detailed explanations below to build foundational mastery.';
    }

    // Render question-by-question review breakdown
    reviewList.innerHTML = results.review.map((item, idx) => {
      const isPass = item.isCorrect;
      const userAns = item.userAnswer !== null && item.userAnswer >= 0
        ? item.options[item.userAnswer]
        : 'Time Expired / No Answer';
      const correctAns = item.options[item.correctAnswer];

      return `
        <div class="review-item ${isPass ? 'pass' : 'fail'}">
          <div class="review-question"><strong>Q${idx + 1}:</strong> ${escapeHtml(item.question)}</div>
          <div class="review-ans-row">
            <span class="user-ans-text">Your Answer: <em>${escapeHtml(userAns)}</em></span>
            <span class="correct-ans-text">Correct: ${escapeHtml(correctAns)}</span>
          </div>
          <div class="review-exp">${escapeHtml(item.explanation)}</div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  restartBtn.addEventListener('click', startQuizSession);
  categorySelect.addEventListener('change', startQuizSession);

  // Initial Quiz Start
  startQuizSession();
});
