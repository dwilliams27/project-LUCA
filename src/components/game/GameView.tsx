// TODO: Bad fixme
import '@pixi/unsafe-eval';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Container } from '@pixi/react';
import { GRID_PADDING, VGridCell } from '@/types';
import { PixiGrid } from '@/components/game/PixiGrid';
import { GameHUD } from '@/components/ui/GameHUD';

interface GameState {
  grid: VGridCell[][];
  selectedCell: { x: number; y: number } | null;
}

export const GameView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: Array(5).fill(null).map((_, y) => 
      Array(5).fill(null).map((_, x) => ({
        position: { x, y },
        resourceBuckets: {},
        processes: []
      }))
    ),
    selectedCell: null
  }));

  const containerSize = useRef({ width: 400, height: 400 });
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const updateSize = () => {
      const rect = gameContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);

      // Only update ref if size actually changed
      if (containerSize.current.width !== newWidth ||
          containerSize.current.height !== newHeight) {
        console.log('Size updated:', { width: newWidth, height: newHeight });
        containerSize.current = { width: newWidth, height: newHeight };
      }
    };

    // Initial size
    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(gameContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <GameHUD>
      <div className="w-full h-full inset-0 bg-black" ref={gameContainerRef}>
        {/* Main game canvas */}
        <Stage 
          width={containerSize.current.width} 
          height={containerSize.current.height}
          options={{ 
            backgroundColor: 0x000000,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio
          }}
        >
          <Container position={[0, 0]}>
            <PixiGrid
              grid={gameState.grid}
              width={containerSize.current.width} 
              height={containerSize.current.height}
            />
          </Container>
        </Stage>
      </div>
    </GameHUD>
  );
};
