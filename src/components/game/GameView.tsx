// TODO: Bad fixme
import '@pixi/unsafe-eval';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Container } from '@pixi/react';
import { GRID_PADDING, VGridCell } from '@/types';
import { PixiGrid } from '@/components/game/PixiGrid';
import { GameHUD } from '@/components/ui/GameHUD';
import { ResourceQuality, ResourceType } from '@/generated/process';
import { Application } from 'pixi.js';

interface GameState {
  grid: VGridCell[][];
  selectedCell: { x: number; y: number } | null;
}

export const GameView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: Array(5).fill(null).map((_, y) => 
      Array(5).fill(null).map((_, x) => ({
        position: { x, y },
        resourceBuckets: {
          [ResourceType.ENERGY]: {
            resources: [
              {
                type: ResourceType.ENERGY,
                quantity: 10,
                quality: ResourceQuality.LOW
              },
              {
                type: ResourceType.ENERGY,
                quantity: 10,
                quality: ResourceQuality.MEDIUM
              },
              {
                type: ResourceType.ENERGY,
                quantity: 10,
                quality: ResourceQuality.HIGH
              }
            ]
          },
          [ResourceType.INFORMATION]: {
            resources: [
              {
                type: ResourceType.INFORMATION,
                quantity: 10,
                quality: ResourceQuality.LOW
              },
              {
                type: ResourceType.INFORMATION,
                quantity: 10,
                quality: ResourceQuality.MEDIUM
              },
              {
                type: ResourceType.INFORMATION,
                quantity: 10,
                quality: ResourceQuality.HIGH
              }
            ]
          },
          [ResourceType.MATTER]: {
            resources: [
              {
                type: ResourceType.MATTER,
                quantity: 10,
                quality: ResourceQuality.LOW
              },
              {
                type: ResourceType.MATTER,
                quantity: 10,
                quality: ResourceQuality.MEDIUM
              },
              {
                type: ResourceType.MATTER,
                quantity: 80,
                quality: ResourceQuality.HIGH
              }
            ]
          },
        },
        processes: []
      }))
    ),
    selectedCell: null
  }));
  const [ containerSize, setContainerSize ] = useState({ width: 400, height: 400 });
  const appRef = useRef<Application | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const initApp = async () => {
      const app = new Application()
      await app.init({
        width: containerSize.width,
        height:  containerSize.height,
        backgroundColor: 0x1a1a1a,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });
      appRef.current = app;

      // Create systems
      // const particleRenderer = new ParticleRenderer(app);
      // const particleSystem = new ParticleSystem(particleRenderer);

      // Set up game loop
      app.ticker.add((delta) => {
        // particleSystem.update(delta);
      });
    };
    initApp();

    const updateSize = () => {
      const rect = gameContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);

      if (containerSize.width !== newWidth ||
          containerSize.height !== newHeight) {
        setContainerSize({ width: newWidth, height: newHeight });
      }
    };

    // TODO: Not working for shrink??
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(gameContainerRef.current);

    return () => {
      appRef.current?.destroy(true, {
        children: true,
        texture: true,
      });
      appRef.current = null;
      resizeObserver.disconnect();
    }
  }, []);

  return (
    <GameHUD>
      <div className="w-full h-full inset-0 bg-black" ref={gameContainerRef}>
        <Stage 
          width={containerSize.width} 
          height={containerSize.height}
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
              width={containerSize.width} 
              height={containerSize.height}
            />
          </Container>
        </Stage>
      </div>
    </GameHUD>
  );
};
