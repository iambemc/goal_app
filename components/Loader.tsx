import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="relative h-20 w-20" role="status">
      <div className="absolute inset-0 border-2 border-violet-500/30 rounded-full"></div>
      <div className="absolute inset-2 border-2 border-violet-500/40 rounded-full animate-spin [animation-duration:2s]"></div>
      <div className="absolute inset-4 border-2 border-violet-500/90 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]"></div>
    </div>
  );
};
