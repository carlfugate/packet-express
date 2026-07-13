import Phaser from 'phaser';
import { QUESTIONS } from '../data/questions';
import { getXPForLevel, getQuestionDifficulty, selectQuestion, isCorrectAnswer } from '../logic/quiz';

export class QuizSystem {
  private scene: Phaser.Scene;
  private currentLevel: number = 1;
  private currentXP: number = 0;
  private upgradeTokens: number = 0;
  private askedQuestions: number[] = [];
  private quizActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  addXP(amount: number): void {
    this.currentXP += amount;
    const needed = getXPForLevel(this.currentLevel);
    if (this.currentXP >= needed) {
      this.currentXP -= needed;
      this.currentLevel++;
      this.triggerQuiz();
    }
  }

  private triggerQuiz(): void {
    const difficulty = getQuestionDifficulty(this.currentLevel);
    const questionIdx = selectQuestion(QUESTIONS, difficulty, this.askedQuestions);
    if (questionIdx === null) return; // no questions left

    this.askedQuestions.push(questionIdx);
    this.quizActive = true;
    this.scene.events.emit('quiz-start', {
      question: QUESTIONS[questionIdx],
      questionIndex: questionIdx,
    });
  }

  submitAnswer(questionIndex: number, answerIndex: number): boolean {
    const correct = isCorrectAnswer(QUESTIONS[questionIndex], answerIndex);
    if (correct) {
      this.upgradeTokens++;
      this.scene.events.emit('quiz-correct', { tokens: this.upgradeTokens });
    } else {
      this.scene.events.emit('quiz-wrong');
    }
    this.quizActive = false;
    return correct;
  }

  getLevel(): number { return this.currentLevel; }
  getXP(): number { return this.currentXP; }
  getXPNeeded(): number { return getXPForLevel(this.currentLevel); }
  getTokens(): number { return this.upgradeTokens; }
  useToken(): boolean {
    if (this.upgradeTokens > 0) {
      this.upgradeTokens--;
      return true;
    }
    return false;
  }
  isQuizActive(): boolean { return this.quizActive; }
}
