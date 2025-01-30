import '@pixi/unsafe-eval';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Container } from '@pixi/react';
import { GameHUD } from '@/components/game/GameHUD';
import { useGameStore } from '@/store/gameStore';
import { useTextStore } from '@/store/textStore';
import { GameWorld } from '@/components/game/GameWorld';
import { genGridCells } from '@/utils/testData';

export const MainGame: React.FC = () => {
  const { initText } = useTextStore();
  const { dimensions, resizeGame, initGrid } = useGameStore();
  const [onResize, setOnResize] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('game-container');
      if (container) {
        resizeGame(container.clientWidth, container.clientHeight);
        setOnResize((container.clientWidth * 1000) + container.clientHeight)
      }
    };

    window.addEventListener('resize', handleResize);

    // TODO: Lol why tf does it not work without this
    setTimeout(() => handleResize());
    setTimeout(() => handleResize(), 10);

    return () => window.removeEventListener('resize', handleResize);
  }, [resizeGame]);

  useEffect(() => {
    // Text
    initText();

    // Grid
    initGrid(genGridCells());
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
            <GameWorld onResize={onResize} />
          </Container>
        </Stage>
      </div>
    </GameHUD>
  );
};
