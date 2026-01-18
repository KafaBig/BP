import React from 'react';

interface QuizOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

const QuizOption: React.FC<QuizOptionProps> = ({ label, text, isSelected, onClick }) => {
  return (
    <div 
      className={`border p-4 rounded cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
          e.preventDefault();
        }
      }}
    >
      <p className="flex items-start">
        <span className="font-medium mr-2">{label}</span>
        <span>{text}</span>
      </p>
    </div>
  );
};

export default QuizOption;