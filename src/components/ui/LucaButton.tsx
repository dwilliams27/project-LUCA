import React from 'react';

interface LucaButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const LucaButton: React.FC<LucaButtonProps> = ({ onClick, children, className = '' }) => (
  <button 
    className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md z-10 items-center ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);
