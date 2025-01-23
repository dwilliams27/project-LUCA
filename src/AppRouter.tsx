import React, { useState } from 'react';
import { MainMenu } from '@/components/ui/MainMenu';
import { GameView } from '@/components/game/GameView';

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
        <GameView />
      )}
    </div>
  );
};
