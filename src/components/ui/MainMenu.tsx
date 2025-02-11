import { MenuButton } from '@/components/ui/MenuButton';
import '@/services/PSE/TestRendererDeepseek';
import React, { useEffect, useState } from 'react';

export interface MainMenuProps {
  onStart: () => void
};

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const handleQuit = () => {
    window.Electron?.ipcRenderer.send('quit-app');
  };

  const [positions, setPositions] = useState(() => 
    Array(20).fill(0).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prevPositions => 
        prevPositions.map(pos => {
          let newX = pos.x + pos.dx;
          let newY = pos.y + pos.dy;
          
          // Bounce off walls
          if (newX < 0 || newX > 100) pos.dx *= -1;
          if (newY < 0 || newY > 100) pos.dy *= -1;
          
          newX = Math.max(0, Math.min(100, newX));
          newY = Math.max(0, Math.min(100, newY));
          
          return {
            x: newX,
            y: newY,
            dx: pos.dx + (Math.random() - 0.5) * 0.1,
            dy: pos.dy + (Math.random() - 0.5) * 0.1
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleGenerateText = async () => {
    // @ts-ignore
    // const result = await window.electronApi.generateText(PromptCatalog.getPopulatedPrompt(GEN_PROCESS, { PROCESS_DESCRIPTION: 'Generate a basic metabolic process for early-stage cells that consumes matter and produces energy.' }));
    // console.log(result);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-evolution">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {positions.map((pos, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-emerald-500 rounded-full blur-3xl"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transition: 'all 0.05s linear'
            }}
          />
        ))}
      </div>

      <div className="mb-16 text-center">
        <h1 className="text-6xl font-bold text-emerald-100 mb-2">Project LUCA</h1>
      </div>

      <div className="flex flex-col items-center z-10">
        <MenuButton
          onClick={() => {
            onStart();
          }
        }>
          Start Evolution
        </MenuButton>
        <MenuButton onClick={handleQuit}>
          Exit
        </MenuButton>
      </div>

      <div className="absolute bottom-4 right-4 text-emerald-600 font-mono text-sm">
        v0.1.0α
      </div>
    </div>
  );
};
