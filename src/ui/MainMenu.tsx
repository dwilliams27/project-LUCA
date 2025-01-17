import React from 'react';

const MainMenu = () => {
  const handleQuit = () => {
    window.Electron?.ipcRenderer.send('quit-app');
  };

  const MenuButton = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="relative group w-64 h-16 mb-4 bg-emerald-800 text-emerald-100 rounded-lg 
        overflow-hidden transition-all duration-300 hover:bg-emerald-700"
    >
      {/* Animated "membrane" background */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-16 h-16 bg-emerald-300 rounded-full blur-xl"
            style={{
              left: `${(i * 30) - 20}%`,
              top: `${Math.sin(i) * 100}%`,
              animation: `membrane-float ${2 + i * 0.5}s infinite ease-in-out`,
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

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-evolution">
      {/* Background "chemical soup" effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `-${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Title with "evolving" text effect */}
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-bold text-emerald-100 mb-2">Project LUCA</h1>
        <p className="text-emerald-400 text-lg italic">Climb Darwin's ladder</p>
      </div>

      <div className="flex flex-col items-center z-10">
        <MenuButton onClick={() => console.log('Start clicked')}>
          Start Evolution
        </MenuButton>
        <MenuButton onClick={handleQuit}>
          Terminate Process
        </MenuButton>
      </div>

      {/* Version number with science-y formatting */}
      <div className="absolute bottom-4 right-4 text-emerald-600 font-mono text-sm">
        v0.1.0α
      </div>
    </div>
  );
};

// Add some keyframes for the floating animation
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, 20px); }
  }
  .animate-float {
    animation: float linear infinite;
  }
`;
document.head.appendChild(style);

export default MainMenu;
