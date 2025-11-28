import React from 'react';
import { Button } from './Button';

interface VideoResultProps {
  videoUrl: string;
  onRestart: () => void;
}

export const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, onRestart }) => {
  return (
    <div className="w-full max-w-3xl text-center space-y-6">
      <h2 className="text-4xl font-bold text-white text-glow">Your Goal, Visualized!</h2>
      <p className="text-gray-300 max-w-2xl mx-auto">
        This is the AI-generated vision of your success. Watch it, feel it, and let it propel you forward on your journey.
      </p>
      
      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl shadow-violet-500/20 border-2 border-violet-700/50 p-1">
        <video src={videoUrl} controls autoPlay loop className="w-full h-full rounded-md" />
      </div>

      <div className="pt-4 space-x-4">
        <a href={videoUrl} download="goal_vision.mp4">
            <Button variant="secondary">Download</Button>
        </a>
        <Button onClick={onRestart}>Create Another Vision</Button>
      </div>
    </div>
  );
};
