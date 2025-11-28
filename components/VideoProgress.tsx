import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';
import { Loader } from './Loader';

interface VideoProgressProps {
    externalMessage: string;
}

export const VideoProgress: React.FC<VideoProgressProps> = ({ externalMessage }) => {
  const [internalMessageIndex, setInternalMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setInternalMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const displayedMessage = externalMessage || LOADING_MESSAGES[internalMessageIndex];

  return (
    <div className="w-full max-w-2xl text-center space-y-8 flex flex-col items-center card-container">
        <Loader />
        <h2 className="text-3xl font-bold text-white text-glow">Your vision is materializing...</h2>
        <div className="bg-black/30 p-4 rounded-lg min-h-[60px] flex items-center justify-center w-full">
            <p className="text-violet-300 text-lg font-medium animate-pulse">{displayedMessage}</p>
        </div>
        <p className="text-gray-400">
            This process can take several minutes. Please remain on this screen.
        </p>
    </div>
  );
};
