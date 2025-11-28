import React, { useState, useCallback, useRef } from 'react';
import { UserImage } from '../types';
import { Button } from './Button';

interface ImageUploaderProps {
  onComplete: (images: { data: string; mimeType: string }[]) => void;
}

interface Base64Result {
    dataUrl: string;
    mimeType: string;
}

const fileToBase64 = (file: File): Promise<Base64Result> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
            dataUrl: reader.result as string,
            mimeType: file.type,
        });
        reader.onerror = error => reject(error);
    });
};

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onComplete }) => {
  const [images, setImages] = useState<UserImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newImages: UserImage[] = [];
      for (const file of files) {
        if(images.length + newImages.length >= 5) break;
        const { dataUrl, mimeType } = await fileToBase64(file);
        newImages.push({ id: `${file.name}-${Date.now()}`, dataUrl, mimeType });
      }
      setImages(prev => [...prev, ...newImages]);
    }
  }, [images.length]);

  const removeImage = (id: string) => {
      setImages(images.filter(img => img.id !== id));
  };
  
  const makePrimary = (id: string) => {
    const newPrimaryImage = images.find(img => img.id === id);
    if (!newPrimaryImage) return;

    const otherImages = images.filter(img => img.id !== id);
    setImages([newPrimaryImage, ...otherImages]);
  };

  const handleSubmit = () => {
    const imageData = images.map(img => ({ 
        data: img.dataUrl.split(',')[1], 
        mimeType: img.mimeType 
    }));
    onComplete(imageData);
  };

  return (
    <div className="w-full max-w-2xl space-y-6 text-center card-container">
      <h2 className="text-3xl font-bold text-white text-glow">Upload Your Selfies</h2>
      <p className="text-gray-400">
        Provide at least two clear photos. The <span className="font-bold text-violet-400">primary</span> image sets the main facial structure.
      </p>
      
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="relative group aspect-square">
            <img 
              src={image.dataUrl} 
              alt="User selfie" 
              className={`rounded-lg object-cover w-full h-full transition-all duration-300 ${index === 0 ? 'ring-2 ring-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'ring-1 ring-gray-700'}`} 
            />
             {index === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-violet-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-sm">
                    Primary
                </div>
            )}
            <button 
              onClick={() => removeImage(image.id)}
              className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="Remove image"
            >
              <XIcon />
            </button>
            {index > 0 && (
                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg z-10">
                    <button 
                        onClick={() => makePrimary(image.id)}
                        className="text-white text-sm font-semibold bg-violet-600/80 hover:bg-violet-700 px-3 py-1 rounded-md"
                    >
                        Set Primary
                    </button>
                 </div>
            )}
          </div>
        ))}
        {images.length < 5 && (
             <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex flex-col justify-center items-center text-gray-500 hover:bg-gray-800/50 hover:border-violet-500 hover:text-violet-400 transition-all duration-300"
                aria-label="Add a new photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                 <span className="text-xs mt-1 font-semibold">Add Photo</span>
             </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
      
      <Button onClick={handleSubmit} disabled={images.length < 2}>
        {`Generate Vision (${images.length}/2 min)`}
      </Button>
    </div>
  );
};
