import React from 'react';

interface MenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="relative group w-64 h-16 mb-4 bg-emerald-800 text-emerald-100 rounded-lg 
               overflow-hidden transition-all duration-300 hover:bg-emerald-700"
  >
    {/* Animated "membrane" background */}
    <div className="absolute inset-0 opacity-20 group-hover:opacity-30">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-16 h-16 bg-emerald-300 rounded-full blur-xl animate-pulse"
          style={{
            left: `${(i * 30) - 20}%`,
            top: `${Math.sin(i) * 100}%`,
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}
    </div>
    
    {/* Button text with DNA-like decoration */}
    <div className="relative flex items-center justify-center w-full h-full">
      <span className="text-xl font-semibold tracking-wide">{children}</span>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-300 rounded-full" />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-300 rounded-full" />
    </div>
  </button>
);

export default MenuButton;
