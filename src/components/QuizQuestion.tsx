import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import QuizOption from './QuizOption';
import ConfidenceSelector from './ConfidenceSelector';

interface QuizQuestionProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  language: string;
  onAnswer: (answer: string, notSelectedAnswers: string[], isCorrect: boolean, confidence: number, is_generated?: boolean) => void;
  loading?: boolean;
  isLastQuestion?: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  language, 
  onAnswer,
  loading = false,
  isLastQuestion = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  
  const questionText = language === 'en' ? question.question : question.question_de;
  const distractors = Array.isArray(question.distractors) ? question.distractors : [];
  const labels = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    const allOptions = [
      ...distractors.map(d => typeof d === 'string' ? d : d.text),
      question.correct_answer
    ].sort(() => Math.random() - 0.5);
    
    setOptions(allOptions);
    setSelectedAnswer(null);
    setSelectedOptionIndex(null);
    setConfidence(null);
  }, [question]);

  const isSelectedFromGeneratedDistractor = () => {
    if (!selectedAnswer) return false;
    
    const selectedDistractor = distractors.find(d => 
      (typeof d === 'string' && d === selectedAnswer) || 
      (typeof d === 'object' && d.text === selectedAnswer)
    );
    
    return selectedDistractor && typeof selectedDistractor === 'object' 
      ? selectedDistractor.is_generated 
      : false;
  };

  const handleOptionSelect = (option: string, index: number) => {
    setSelectedAnswer(option);
    setSelectedOptionIndex(index);
  };

  const handleConfidenceSelect = (value: number) => {
    setConfidence(value);
  };

  const handleSubmit = () => {
    if (selectedAnswer && confidence !== null && !loading) {
      const notSelectedAnswers = options.filter(option => option !== selectedAnswer);
      const isCorrect = selectedAnswer === question.correct_answer;
      const isGenerated = isSelectedFromGeneratedDistractor();
      
      onAnswer(selectedAnswer, notSelectedAnswers, isCorrect, confidence, isGenerated);
    }
  };

  const isSubmitDisabled = !selectedAnswer || confidence === null || loading;

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Question</h2>
        <p className="mb-6 text-lg">{questionText}</p>
        
        <h3 className="font-semibold mb-4">Select the correct answer:</h3>
        <div className="space-y-4">
          {options.map((option, index) => (
            <QuizOption
              key={index}
              label={`${labels[index]}`}
              text={option}
              isSelected={selectedOptionIndex === index}
              onClick={() => handleOptionSelect(option, index)}
            />
          ))}
        </div>
      </div>

      <ConfidenceSelector
        value={confidence}
        onChange={handleConfidenceSelect}
        disabled={selectedAnswer === null}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`px-6 py-2 rounded font-medium transition-colors ${
            isSubmitDisabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLastQuestion ? 'Submitting Quiz...' : 'Submitting...'}
            </span>
          ) : (
            isLastQuestion ? 'Submit Quiz' : 'Submit Answer'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizQuestion;