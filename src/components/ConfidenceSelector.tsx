import React from 'react';

interface ConfidenceSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled: boolean;
}

const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({ value, onChange, disabled }) => {
  const options = [
    { value: 1, label: '1 (Not confident)' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5 (Very confident)' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="font-semibold mb-4">How confident are you about your answer?</h3>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label 
            key={option.value}
            className={`
              inline-flex items-center px-4 py-2 rounded-full cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
              ${value === option.value ? 'bg-blue-100 border-blue-500 border' : 'border border-gray-300'}
            `}
          >
            <input
              type="radio"
              name="confidence"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className="sr-only"
              aria-label={`Confidence level ${option.label}`}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ConfidenceSelector;