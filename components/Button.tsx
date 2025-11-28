import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-3 font-bold rounded-lg focus:outline-none transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-transparent disabled:text-gray-500";
  
  const variantClasses = {
    primary: "border-2 border-violet-500 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]",
    secondary: "border-2 border-gray-600 text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 hover:shadow-[0_0_15px_rgba(156,163,175,0.4)]",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};
