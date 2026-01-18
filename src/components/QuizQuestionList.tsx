import React, { useEffect, useRef } from 'react';
import { Question, Answer } from '../types';
import QuizQuestionCard from './QuizQuestionCard';

interface QuizQuestionListProps {
  questions: Question[];
  language: string;
  answers: Answer[];
  onAnswerUpdate: (questionIndex: number, answer: Answer) => void;
  onQuestionFocus: (index: number) => void;
}

const QuizQuestionList: React.FC<QuizQuestionListProps> = ({
  questions,
  language,
  answers,
  onAnswerUpdate,
  onQuestionFocus
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-question-index') || '0');
            onQuestionFocus(index);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    questionRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [questions, onQuestionFocus]);

  const getAnswerForQuestion = (question: Question): Answer | undefined => {
    return answers.find(a => a.question === question.question);
  };

  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <div
          key={question.id}
          id={`question-${index}`}
          ref={(el) => (questionRefs.current[index] = el)}
          data-question-index={index}
          className="scroll-mt-6"
        >
          <QuizQuestionCard
            question={question}
            questionIndex={index}
            language={language}
            existingAnswer={getAnswerForQuestion(question)}
            onAnswerUpdate={(answer) => onAnswerUpdate(index, answer)}
          />
        </div>
      ))}
    </div>
  );
};

export default QuizQuestionList;