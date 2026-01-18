import { Question } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : '';  

interface StartQuizResponse {
  status: string;
  quiz_id: string;
  message: string;
}

interface GetAllQuestionsResponse {
  status: string;
  quiz_id: string;
  questions: Question[];
  total_questions: number;
}

interface SubmitQuizRequest {
  quiz_id: string;
  answers: any[];
  score: number;
  avg_confidence: number;
  total_questions: number;
}

export const api = {
  startQuiz: async (): Promise<StartQuizResponse> => {
    const response = await fetch(`${API_BASE_URL}/start_quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to start quiz';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  },

  getAllQuestions: async (): Promise<GetAllQuestionsResponse> => {
    const response = await fetch(`${API_BASE_URL}/get_all_questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to load questions';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  },

  submitQuiz: async (quizData: SubmitQuizRequest): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/submit_quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to submit quiz';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  }
};

export type { StartQuizResponse, GetAllQuestionsResponse, SubmitQuizRequest };