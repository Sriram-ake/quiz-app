const test = require('node:test');
const assert = require('node:assert/strict');
const { QuizEngine, QUESTION_BANK } = require('../js/quizEngine.js');

test('QuizEngine - initialization and category filtering', () => {
  const quiz = new QuizEngine(QUESTION_BANK);
  const qData = quiz.startQuiz('Web Architecture', 5);

  assert.ok(qData !== null);
  assert.equal(quiz.activeQuestions.length, 2);
  assert.ok(quiz.activeQuestions.every(q => q.category === 'Web Architecture'));
});

test('QuizEngine - answer submission and evaluation', () => {
  const quiz = new QuizEngine(QUESTION_BANK);
  quiz.startQuiz('all', 3);

  const cur = quiz.getCurrentQuestion();
  const correctIdx = cur.question.correctIndex;

  // Submit correct answer
  const result = quiz.submitAnswer(correctIdx);
  assert.equal(result.isCorrect, true);
  assert.equal(result.correctIndex, correctIdx);

  // Advance
  quiz.nextQuestion();
  assert.equal(quiz.currentIndex, 1);
});

test('QuizEngine - final results calculation and review data', () => {
  const quiz = new QuizEngine(QUESTION_BANK);
  quiz.startQuiz('all', 2);

  // Q1: submit correct
  const q1 = quiz.getCurrentQuestion();
  quiz.submitAnswer(q1.question.correctIndex);
  quiz.nextQuestion();

  // Q2: submit incorrect
  const q2 = quiz.getCurrentQuestion();
  const wrongIdx = (q2.question.correctIndex + 1) % 4;
  quiz.submitAnswer(wrongIdx);
  quiz.nextQuestion(); // Finishes quiz

  assert.equal(quiz.isCompleted, true);

  const results = quiz.getResults();
  assert.equal(results.total, 2);
  assert.equal(results.correct, 1);
  assert.equal(results.percent, 50);
  assert.equal(results.grade, 'Proficient Developer');
  assert.equal(results.review.length, 2);
  assert.equal(results.review[0].isCorrect, true);
  assert.equal(results.review[1].isCorrect, false);
});
