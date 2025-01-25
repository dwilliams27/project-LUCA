import '@pixi/unsafe-eval';

import React, { useEffect, useRef } from 'react';
import { Stage, Container } from '@pixi/react';
import { PixiGrid } from '@/components/game/PixiGrid';
import { GameHUD } from '@/components/ui/GameHUD';
import { Application } from 'pixi.js';
import { useGameStore, useGrid } from '@/store/gameStore';

export const GameView: React.FC = () => {
  const { dimensions, resizeGame } = useGameStore();
  const { cells } = useGrid();
  const appRef = useRef<Application | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('game-container');
      if (container) {
        console.log(container.clientWidth, container.clientHeight);
        resizeGame(container.clientWidth, container.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

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
      <div className="w-full h-full inset-0 bg-black" ref={gameContainerRef}>
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
              grid={cells}
              width={dimensions.width} 
              height={dimensions.height}
            />
          </Container>
        </Stage>
      </div>
    </GameHUD>
  );
};
