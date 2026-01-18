import React from 'react';

interface LanguageSelectorProps {
  language: string;
  onChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onChange }) => {
  return (
    <div className="mb-6 flex items-center">
      <span className="mr-3 font-medium">Language:</span>
      <div className="flex space-x-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="language"
            value="en"
            checked={language === 'en'}
            onChange={() => onChange('en')}
            className="sr-only"
          />
          <span className={`px-3 py-1 rounded-full ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            English
          </span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="language"
            value="de"
            checked={language === 'de'}
            onChange={() => onChange('de')}
            className="sr-only"
          />
          <span className={`px-3 py-1 rounded-full ${language === 'de' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Deutsch
          </span>
        </label>
      </div>
    </div>
  );
};

export default LanguageSelector;