import React, { useState } from 'react';
import { QUESTIONS } from '../constants';
import { Button } from './Button';

interface QuestionnaireProps {
  onComplete: (answers: string[]) => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(answers[currentQuestionIndex + 1] || '');
    } else {
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
    }
  }

  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  return (
    <div className="w-full max-w-2xl space-y-8 card-container">
        <div>
            <span className="font-semibold text-violet-400">QUESTION {currentQuestionIndex + 1} / {QUESTIONS.length}</span>
            <h2 className="text-3xl font-bold text-gray-100 mt-2 text-glow">{QUESTIONS[currentQuestionIndex]}</h2>
        </div>

        <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 progress-bar-glow" 
              style={{ width: `${progress}%` }}
            ></div>
        </div>

      <textarea
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        placeholder="Type your vision here..."
        className="w-full p-4 bg-black/30 border-2 border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:border-violet-500/80 transition-all h-40 resize-none"
        aria-label={QUESTIONS[currentQuestionIndex]}
      />
      
      <div className="flex justify-between items-center w-full">
        <Button variant="secondary" onClick={handleBack} disabled={currentQuestionIndex === 0}>
            Back
        </Button>
        <Button onClick={handleNext} disabled={currentAnswer.trim() === ''}>
          {isLastQuestion ? 'Proceed to Upload' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
