import React from 'react';
import { Answer } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  answers: Answer[];
  avgConfidence: number;
  onRestart: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
  score, 
  totalQuestions, 
  answers, 
  avgConfidence,
  onRestart
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Quiz Results</h2>
      
      <div className="mb-8 text-center">
        <p className="text-4xl font-bold mb-2">
          <span className={getScoreColor()}>{score}</span>
          <span className="text-gray-700">/{totalQuestions}</span>
        </p>
        <p className="text-lg">
          You scored {percentage}% with an average confidence of {avgConfidence.toFixed(1)}/5
        </p>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Question Summary</h3>
        <div className="space-y-4">
          {answers.map((answer, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start">
                {answer.is_correct ? (
                  <CheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle className="text-red-500 mr-2 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium mb-2">{answer.question}</p>
                  <p className="text-sm">
                    Your answer: <span className={answer.is_correct ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {answer.answer}
                    </span>
                  </p>
                  {!answer.is_correct && (
                    <p className="text-sm mt-1">
                      Correct answer: <span className="text-green-600 font-medium">
                        {answer.correct_answer || "Not available"}
                      </span>
                    </p>
                  )}
                  <p className="text-sm mt-1">Confidence: {answer.confidence}/5</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResults;