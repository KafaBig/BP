export interface Question {
  id: string;
  question: string;
  question_de: string;
  correct_answer: string;
  distractors: Distractor[];
  is_generated?: boolean;
}

export interface Distractor {
    text: string;
    is_generated: boolean;
  }

export interface Answer {
  question: string;
  answer: string;
  not_selected_answers: string[];
  is_correct: boolean;
  confidence: number;
  correct_answer: string;
  is_generated?: boolean;
}

export interface QuizResult {
  participant_name: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  avg_confidence: number;
  correct_answers: Answer[];
}