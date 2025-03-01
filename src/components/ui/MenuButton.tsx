import React from 'react';

interface MenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`relative group h-16 bg-emerald-800 text-emerald-100 rounded-lg 
               overflow-hidden transition-all duration-300 hover:bg-emerald-700 ${className}`}
  >
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="ml-3 mr-auto w-2 h-2 bg-emerald-300 rounded-full" />
      <span className="mx-2 text-xl font-semibold tracking-wide">{children}</span>
      <div className="mr-3 ml-auto w-2 h-2 bg-emerald-300 rounded-full" />
    </div>
  </button>
);
