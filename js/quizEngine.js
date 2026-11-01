/**
 * QuizMaster Pro Engine
 * Pure quiz state machine, scoring, question bank, and results evaluation.
 * Dual-environment compatible (Node.js and Browser).
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.QuizEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const QUESTION_BANK = [
    // Web Architecture
    {
      id: 'q1',
      category: 'Web Architecture',
      question: 'What is the primary architectural purpose of a Content Delivery Network (CDN)?',
      options: [
        'To compile backend TypeScript code on edge workers',
        'To cache static assets geographically closer to users to reduce latency',
        'To replace primary relational database clusters',
        'To generate cryptographic SSL certificates on the client'
      ],
      correctIndex: 1,
      explanation: 'CDNs distribute cached copies of static assets (images, stylesheets, scripts) across geographically dispersed Points of Presence (PoPs), minimizing round-trip latency to the origin server.'
    },
    {
      id: 'q2',
      category: 'Web Architecture',
      question: 'In HTTP/2 and HTTP/3, what key limitation of HTTP/1.1 pipelining is eliminated?',
      options: [
        'Domain Name System (DNS) propagation delays',
        'Head-of-Line (HoL) blocking at the application stream layer',
        'TLS handshake requirements',
        'CORS preflight validation'
      ],
      correctIndex: 1,
      explanation: 'HTTP/2 introduces binary framing and multiplexing over a single TCP connection, allowing concurrent streams and eliminating application-layer Head-of-Line blocking.'
    },

    // Databases & Systems
    {
      id: 'q3',
      category: 'Databases & Systems',
      question: 'According to the CAP Theorem, which two guarantees does a distributed network partition (P) force you to choose between?',
      options: [
        'Consistency (C) and Availability (A)',
        'Concurrency (C) and Atomicity (A)',
        'Compression (C) and Authentication (A)',
        'Caching (C) and Authorization (A)'
      ],
      correctIndex: 0,
      explanation: 'Under network partitions (P), a distributed system must choose between returning consistent, up-to-date data across all nodes (Consistency) or remaining responsive even if nodes have stale data (Availability).'
    },
    {
      id: 'q4',
      category: 'Databases & Systems',
      question: 'Which PostgreSQL index type is most optimized for full-text search and array containment queries?',
      options: [
        'B-Tree Index',
        'BRIN (Block Range Index)',
        'GIN (Generalized Inverted Index)',
        'Hash Index'
      ],
      correctIndex: 2,
      explanation: 'GIN (Generalized Inverted Index) stores mappings from composite item components (words, JSON keys, array elements) to row pointers, making it ideal for text and document searching.'
    },

    // Security & Infrastructure
    {
      id: 'q5',
      category: 'Security & Cloud',
      question: 'What security attack does setting the HttpOnly cookie flag prevent?',
      options: [
        'Cross-Site Request Forgery (CSRF)',
        'Cross-Site Scripting (XSS) session token theft via document.cookie',
        'Distributed Denial of Service (DDoS)',
        'SQL Injection in form parameters'
      ],
      correctIndex: 1,
      explanation: 'The HttpOnly flag instructs the browser that the cookie cannot be accessed via client-side JavaScript (e.g. document.cookie), mitigating XSS cookie harvesting.'
    },
    {
      id: 'q6',
      category: 'Security & Cloud',
      question: 'In Kubernetes, what controller ensures a specified number of identical pod replicas are running at all times?',
      options: [
        'Ingress Controller',
        'ReplicaSet',
        'ConfigMap Controller',
        'Kube-DNS Service'
      ],
      correctIndex: 1,
      explanation: 'A ReplicaSet continuously monitors pod health and spawns or terminates pods to maintain the declared target replica count.'
    },

    // JavaScript Core
    {
      id: 'q7',
      category: 'JavaScript Core',
      question: 'In the JavaScript event loop, what executes with higher priority immediately following the current synchronous call stack?',
      options: [
        'Microtask Queue (Promise callbacks, queueMicrotask)',
        'Macrotask Queue (setTimeout, setInterval)',
        'Web Worker Background Thread',
        'IndexedDB transaction flush'
      ],
      correctIndex: 0,
      explanation: 'Microtasks (resolved Promises, process.nextTick, queueMicrotask) are drained completely after the synchronous stack empties, before the browser picks the next macrotask.'
    },
    {
      id: 'q8',
      category: 'JavaScript Core',
      question: 'What is the output of `typeof null` in standard JavaScript?',
      options: [
        '"null"',
        '"undefined"',
        '"object"',
        '"boolean"'
      ],
      correctIndex: 2,
      explanation: 'In the original JavaScript implementation, values were stored with a type tag. Objects had tag 0, and null was represented as a NULL pointer (0x00), resulting in typeof null evaluating to "object".'
    }
  ];

  class QuizEngine {
    constructor(questionBank = QUESTION_BANK) {
      this.allQuestions = [...questionBank];
      this.reset();
    }

    reset() {
      this.activeQuestions = [];
      this.currentIndex = 0;
      this.userAnswers = [];
      this.isCompleted = false;
      this.selectedCategory = 'all';
    }

    startQuiz(category = 'all', count = 5) {
      this.reset();
      this.selectedCategory = category;

      let filtered = [...this.allQuestions];
      if (category !== 'all') {
        filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
      }

      // Shuffle filtered questions
      filtered.sort(() => Math.random() - 0.5);

      this.activeQuestions = filtered.slice(0, Math.min(count, filtered.length));
      this.userAnswers = Array(this.activeQuestions.length).fill(null);
      return this.getCurrentQuestion();
    }

    getCurrentQuestion() {
      if (this.currentIndex >= this.activeQuestions.length) {
        return null;
      }
      return {
        question: this.activeQuestions[this.currentIndex],
        index: this.currentIndex,
        total: this.activeQuestions.length
      };
    }

    submitAnswer(choiceIndex) {
      if (this.isCompleted || this.currentIndex >= this.activeQuestions.length) {
        return null;
      }

      const currentQ = this.activeQuestions[this.currentIndex];
      const isCorrect = choiceIndex === currentQ.correctIndex;

      this.userAnswers[this.currentIndex] = {
        questionId: currentQ.id,
        selectedIndex: choiceIndex,
        isCorrect,
        correctIndex: currentQ.correctIndex,
        explanation: currentQ.explanation
      };

      return this.userAnswers[this.currentIndex];
    }

    nextQuestion() {
      if (this.currentIndex < this.activeQuestions.length - 1) {
        this.currentIndex += 1;
        return this.getCurrentQuestion();
      }

      this.isCompleted = true;
      return null;
    }

    getResults() {
      if (!this.isCompleted && this.userAnswers.every(a => a === null)) {
        return null;
      }

      const total = this.activeQuestions.length;
      const correct = this.userAnswers.filter(a => a && a.isCorrect).length;
      const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

      let grade = 'Needs Practice';
      if (percent >= 90) grade = 'Staff Architect';
      else if (percent >= 75) grade = 'Senior Engineer';
      else if (percent >= 50) grade = 'Proficient Developer';

      const review = this.activeQuestions.map((q, i) => ({
        question: q.question,
        category: q.category,
        options: q.options,
        userAnswer: this.userAnswers[i] ? this.userAnswers[i].selectedIndex : null,
        correctAnswer: q.correctIndex,
        isCorrect: this.userAnswers[i] ? this.userAnswers[i].isCorrect : false,
        explanation: q.explanation
      }));

      return {
        total,
        correct,
        percent,
        grade,
        review
      };
    }
  }

  return {
    QUESTION_BANK,
    QuizEngine
  };
});
