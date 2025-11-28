import React, { useState } from 'react';
import { AppStep } from './types';
import { Questionnaire } from './components/Questionnaire';
import { ImageUploader } from './components/ImageUploader';
import { VideoProgress } from './components/VideoProgress';
import { VideoResult } from './components/VideoResult';
import { generateVideoPrompt, generateGoalVideo } from './services/geminiService';
import { Button } from './components/Button';

const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <div className="text-center max-w-2xl space-y-8">
        <h1 className="text-5xl font-extrabold text-white tracking-tight sm:text-7xl text-glow">
            Welcome to <span className="text-gradient-purple">Goal Vision AI</span>
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed">
            Transform your ambitions into a vivid reality. Answer questions about your primary goal, provide your selfies, and our AI will generate a powerful, personalized video of you achieving it.
        </p>
        <div className="pt-4">
            <Button onClick={onStart}>Start Your Visualization</Button>
        </div>
    </div>
);

const ErrorScreen: React.FC<{ message: string; onRestart: () => void }> = ({ message, onRestart }) => (
    <div className="text-center max-w-xl space-y-6 bg-red-900/20 border border-red-500/50 p-8 rounded-lg shadow-2xl shadow-red-500/20">
        <div className="flex justify-center items-center">
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h2 className="text-3xl font-bold text-red-300">System Alert</h2>
        <p className="text-red-200">{message}</p>
        <Button variant="secondary" onClick={onRestart}>Restart Process</Button>
    </div>
);

interface ImageData {
    data: string;
    mimeType: string;
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Intro);
  const [answers, setAnswers] = useState<string[]>([]);
  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleStart = () => {
    setStep(AppStep.Questionnaire);
  };

  const handleQuestionnaireComplete = (newAnswers: string[]) => {
    setAnswers(newAnswers);
    setStep(AppStep.ImageUpload);
  };

  const handleImageUploadComplete = async (newImageData: ImageData[]) => {
    setImageData(newImageData);
    setStep(AppStep.Generating);
    setLoadingMessage(''); // Reset loading message initially

    try {
      setLoadingMessage("Generating a creative prompt...");
      const prompt = await generateVideoPrompt(answers);
      
      const url = await generateGoalVideo(prompt, newImageData, setLoadingMessage);
      
      setVideoUrl(url);
      setStep(AppStep.Complete);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unknown error occurred during video generation.";
      setErrorMessage(message);
      setStep(AppStep.Error);
    }
  };

  const handleRestart = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setStep(AppStep.Intro);
    setAnswers([]);
    setImageData([]);
    setVideoUrl('');
    setErrorMessage('');
    setLoadingMessage('');
  };

  const renderStep = () => {
    switch (step) {
      case AppStep.Intro:
        return <IntroScreen onStart={handleStart} />;
      case AppStep.Questionnaire:
        return <Questionnaire onComplete={handleQuestionnaireComplete} />;
      case AppStep.ImageUpload:
        return <ImageUploader onComplete={handleImageUploadComplete} />;
      case AppStep.Generating:
        return <VideoProgress externalMessage={loadingMessage} />;
      case AppStep.Complete:
        return <VideoResult videoUrl={videoUrl} onRestart={handleRestart} />;
      case AppStep.Error:
        return <ErrorScreen message={errorMessage} onRestart={handleRestart} />;
      default:
        return <IntroScreen onStart={handleStart} />;
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      {renderStep()}
    </main>
  );
};

export default App;
