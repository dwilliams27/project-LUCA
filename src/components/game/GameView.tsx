import '@pixi/unsafe-eval';

import React, { useEffect, useRef } from 'react';
import { Stage, Container } from '@pixi/react';
import { PixiGrid } from '@/components/game/PixiGrid';
import { GameHUD } from '@/components/ui/GameHUD';
import { Application } from 'pixi.js';
import { useGameStore, useGrid } from '@/store/gameStore';
import { useTextStore } from '@/store/textStore';

export const GameView: React.FC = () => {
  const { initText } = useTextStore();
  const { dimensions, resizeGame } = useGameStore();
  const grid = useGrid();
  const appRef = useRef<Application | null>(null);
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
    if (!gameContainerRef.current) return;

    appRef.current = new Application({
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: 0x1A1A1A,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    initText();

    return () => {
      appRef.current?.destroy(true, {
        children: true,
        texture: true,
      });
      appRef.current = null;
    }
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
            <PixiGrid
              cells={grid.cells}
              width={dimensions.gridLength}
              height={dimensions.gridLength}
            />
          </Container>
        </Stage>
      </div>
    </GameHUD>
  );
};
