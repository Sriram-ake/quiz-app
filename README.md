# 10 QuizMaster Pro

A Royal Sapphire EdTech engineering challenge featuring timed multiple-choice assessments across 4 technical domains, real-time architectural explanations, performance grading tiers, and comprehensive review breakdowns.

## Visual Design Identity
- **Archetype**: Royal Sapphire EdTech Challenge
- **Color Palette**: Royal Sapphire (`#2563eb`), Deep Lapis Navy (`#080d1a`), Card Surface (`#101b33`), Electric Azure (`#38bdf8`), Gold Grade (`#f59e0b`), Verification Emerald (`#10b981`), Warning Ruby (`#ef4444`).
- **Typography**: Clean structured system sans-serif paired with monospaced timer digits and letter badges (`A, B, C, D`).
- **Kinetics**: Smooth 20-second decreasing progress bar, instant color-coded answer validation, and expandable architectural explanations.

## Core Features
- **Categorized Question Bank**: Comprehensive technical questions covering:
  - Web Architecture & CDNs
  - Distributed Systems & Databases (CAP Theorem, Indexing)
  - Security & Cloud Infrastructure (HttpOnly, Kubernetes)
  - JavaScript Core (Event Loop, Type Systems)
- **20-Second Dynamic Question Timer**: Automatically tracks time per question with an animated decreasing progress bar and auto-submission on timeout.
- **Immediate Architectural Feedback**: Reveals exact reasons and architectural background for why an answer is right or wrong after every choice.
- **Performance Evaluation & Grading**: Evaluates overall accuracy with rank classifications ("Staff Architect", "Senior Engineer", "Proficient Developer").
- **Question-by-Question Review Breakdown**: Detailed audit report at the end showing question prompts, user choices, correct answers, and reference notes.

## Automated Unit Tests
Run the unit test suite:
```bash
node --test test/quizEngine.test.js
```
Verified Test Cases (3 passing, 0 failing):
- Quiz initialization and domain category filtering
- User answer submission, correct index verification, and state progression
- End-of-quiz scoring, grade assignment, and review audit dataset integrity
