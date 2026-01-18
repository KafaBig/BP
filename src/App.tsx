import { useState } from 'react';
import { Question, Answer } from './types';
import { api } from './services/api';
import LanguageSelector from './components/LanguageSelector';
import ProgressBar from './components/ProgressBar';
import QuizQuestionList from './components/QuizQuestionList';
import QuizResults from './components/QuizResults';
import { BookOpen, Brain } from 'lucide-react';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startResponse = await api.startQuiz();
      setQuizId(startResponse.quiz_id);
      
      const questionsResponse = await api.getAllQuestions();
      setQuestions(questionsResponse.questions);
      setAnswers([]);
      setQuizStarted(true);
      setQuizCompleted(false);
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError('Failed to start quiz. Please try again.');
      console.error('Error starting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerUpdate = (questionIndex: number, answer: Answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const handleQuestionFocus = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const submitQuiz = async () => {
    if (!quizId || answers.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const score = answers.filter(a => a.is_correct).length;
      const avgConfidence = answers.reduce((sum, a) => sum + a.confidence, 0) / answers.length;

      await api.submitQuiz({
        quiz_id: quizId,
        answers,
        score,
        avg_confidence: avgConfidence,
        total_questions: questions.length
      });

      setQuizCompleted(true);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      console.error('Error submitting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuizId(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  const allQuestionsAnswered = questions.length > 0 && answers.length === questions.length && 
    answers.every(a => a.answer && a.confidence !== undefined);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="text-blue-600 w-10 h-10 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Math Quiz</h1>
          </div>
          <p className="text-gray-600">Test your math skills with our interactive quiz</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {!quizStarted && !quizCompleted && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to Test Your Math Skills?</h2>
            <p className="mb-8 text-gray-600">
              This quiz contains multiple math questions with multiple-choice answers.
              You'll also rate your confidence for each answer.
            </p>
            <button
              onClick={startQuiz}
              disabled={loading}
              className={`
                px-6 py-3 rounded-lg font-medium text-white
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
                transition-colors
              `}
            >
              {loading ? 'Starting Quiz...' : 'Start Quiz'}
            </button>
          </div>
        )}

        {quizStarted && !quizCompleted && questions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <LanguageSelector language={language} onChange={setLanguage} />
                <div className="text-sm text-gray-600">
                  {answers.length} of {questions.length} answered
                </div>
              </div>
              
              <ProgressBar 
                current={answers.length} 
                total={questions.length} 
              />
            </div>

            <QuizQuestionList
              questions={questions}
              language={language}
              answers={answers}
              onAnswerUpdate={handleAnswerUpdate}
              onQuestionFocus={handleQuestionFocus}
            />

            {allQuestionsAnswered && (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-4">All Questions Answered!</h3>
                <p className="mb-6 text-gray-600">
                  You've answered all {questions.length} questions. Ready to submit your quiz?
                </p>
                <button
                  onClick={submitQuiz}
                  disabled={loading}
                  className={`
                    px-6 py-3 rounded-lg font-medium text-white
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
                    transition-colors
                  `}
                >
                  {loading ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            )}
          </div>
        )}

        {quizCompleted && (
          <QuizResults
            score={answers.filter(a => a.is_correct).length}
            totalQuestions={answers.length}
            answers={answers}
            avgConfidence={answers.reduce((sum, a) => sum + a.confidence, 0) / answers.length}
            onRestart={restartQuiz}
          />
        )}
      </div>
    </div>
  );
}

export default App;