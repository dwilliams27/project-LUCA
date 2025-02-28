import '@pixi/unsafe-eval';

import React, { useEffect, useRef } from 'react';
import { Stage, Container } from '@pixi/react';
import { GameHUD } from '@/components/game/GameHUD';
import { useTextStore } from '@/store/text-store';
import { GameWorld } from '@/components/game/GameWorld';
import { GameLoop } from '@/components/game/GameLoop';
import { useDimensionStore, useGridStore, useResizeGame } from '@/store/game-store';

export const MainGame: React.FC = () => {
  const { initText } = useTextStore();
  const dimensions = useDimensionStore();
  const resizeGame = useResizeGame();
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('game-container');
      if (container) {
        resizeGame(container.clientWidth, container.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // TODO: Lol why tf does it not work without this
    setTimeout(() => handleResize());
    setTimeout(() => handleResize(), 10);

    return () => window.removeEventListener('resize', handleResize);
  }, [resizeGame]);

  useEffect(() => {
    initText();
  }, []);

  return (
    <GameHUD>
      <div className="w-full h-full inset-0 bg-black" id="game-container" ref={gameContainerRef}>
        <Stage
          width={dimensions.width} 
          height={dimensions.height}
          options={{ 
            backgroundColor: 0x000000,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio
          }}
        >
          <Container position={[0, 0]}>
            <GameLoop />
            <GameWorld />
          </Container>
        </Stage>
      </div>
    </GameHUD>
  );
};
