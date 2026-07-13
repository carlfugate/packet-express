export interface Question {
  id: string;
  text: string;
  answers: string[];
  correct: number;
  explanation: string;
}

export const QUESTIONS: Question[] = [];
