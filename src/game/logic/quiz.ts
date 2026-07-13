export interface QuizQuestion {
  question: string;
  answers: string[];
  correct: number;
  difficulty: 1 | 2 | 3;
  category: string;
}

export function getXPForLevel(level: number): number {
  return 50 + (level - 1) * 40 + Math.pow(level - 1, 2) * 5;
}

export function getQuestionDifficulty(playerLevel: number): 1 | 2 | 3 {
  if (playerLevel <= 3) return 1;
  if (playerLevel <= 7) return 2;
  return 3;
}

export function selectQuestion(
  questions: QuizQuestion[],
  difficulty: 1 | 2 | 3,
  previouslyAsked: number[]
): number | null {
  const eligible = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => q.difficulty === difficulty && !previouslyAsked.includes(i));
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)].i;
}

export function isCorrectAnswer(question: QuizQuestion, answerIndex: number): boolean {
  return answerIndex === question.correct;
}
