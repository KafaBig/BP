import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, Answer } from '../types';
import QuizOption from './QuizOption';

interface QuizQuestionCardProps {
  question: Question;
  questionIndex: number;
  language: string;
  existingAnswer?: Answer;
  onAnswerUpdate: (answer: Answer) => void;
}

const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  questionIndex,
  language,
  existingAnswer,
  onAnswerUpdate
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(existingAnswer?.answer || null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(existingAnswer?.confidence || null);
  const [options, setOptions] = useState<string[]>([]);

  const questionText = language === 'en' ? question.question : question.question_de;
  const distractors = Array.isArray(question.distractors) ? question.distractors : [];
  const labels = ['A', 'B', 'C', 'D'];
  const confidenceOptions = [
    { value: 1, label: '1 (Not confident)' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5 (Very confident)' },
  ];

  const optionsArray = useMemo(() => {
    const allOptions = [
      ...distractors.map(d => typeof d === 'string' ? d : d.text),
      question.correct_answer
    ].sort(() => Math.random() - 0.5);
    return allOptions;
  }, [question.correct_answer, distractors]);

  useEffect(() => {
    setOptions(optionsArray);

    if (existingAnswer) {
      const existingIndex = optionsArray.findIndex(option => option === existingAnswer.answer);
      setSelectedOptionIndex(existingIndex);
    }
  }, [optionsArray, existingAnswer]);

  const updateAnswer = useCallback(() => {
    if (selectedAnswer && confidence !== null) {
      const notSelectedAnswers = options.filter(option => option !== selectedAnswer);
      const isCorrect = selectedAnswer === question.correct_answer;

      const answer: Answer = {
        question: question.question,
        answer: selectedAnswer,
        not_selected_answers: notSelectedAnswers,
        is_correct: isCorrect,
        confidence,
        correct_answer: question.correct_answer,
        is_generated: question.is_generated
      };

      onAnswerUpdate(answer);
    }
  }, [selectedAnswer, confidence, options, question.correct_answer, question.question, question.is_generated, onAnswerUpdate]);

  useEffect(() => {
    updateAnswer();
  }, [updateAnswer]);

  const handleOptionSelect = (option: string, index: number) => {
    setSelectedAnswer(option);
    setSelectedOptionIndex(index);
  };

  const handleConfidenceSelect = (value: number) => {
    setConfidence(value);
  };

  const isAnswered = selectedAnswer && confidence !== null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Question and Options */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Question {questionIndex + 1}
            </h2>
            {isAnswered && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                Answered
              </span>
            )}
          </div>
          
          <p className="mb-6 text-gray-700 leading-relaxed">{questionText}</p>
          
          <h3 className="font-medium mb-4 text-gray-800">Select the correct answer:</h3>
          <div className="space-y-3">
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

        {/* Confidence Selector */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 h-full">
            <h3 className="font-medium mb-4 text-gray-800">Confidence Level</h3>
            <p className="text-sm text-gray-600 mb-4">
              How confident are you about your answer?
            </p>
            
            <div className="space-y-2">
              {confidenceOptions.map((option) => (
                <label 
                  key={option.value}
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}
                    ${confidence === option.value ? 'bg-blue-100 border-blue-500 border-2' : 'bg-white border border-gray-200'}
                  `}
                >
                  <input
                    type="radio"
                    name={`confidence-${questionIndex}`}
                    value={option.value}
                    checked={confidence === option.value}
                    onChange={() => handleConfidenceSelect(option.value)}
                    disabled={selectedAnswer === null}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0
                    ${confidence === option.value ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                  `}>
                    {confidence === option.value && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>

            {selectedAnswer && confidence && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {selectedAnswer}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Confidence:</strong> {confidence}/5
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionCard;