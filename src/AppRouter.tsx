import React, { useState } from 'react';
import { MainMenu } from '@/components/ui/MainMenu';
import { MainGame } from '@/components/game/MainGame';

export type View = 'MAIN_MENU' | 'GAME';

export const AppRouter: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('MAIN_MENU');

  const handleStartGame = () => {
    setCurrentView('GAME');
  };

  return (
    <div className="w-full h-full">
      {currentView === 'MAIN_MENU' && (
        <MainMenu onStart={handleStartGame} />
      )}
      {currentView === 'GAME' && (
        <MainGame />
      )}

      {/* UI Demo buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-10">
        
      </div>
    </div>
  );
};
