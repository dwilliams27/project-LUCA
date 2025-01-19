import React, { useEffect, useRef } from 'react';
import { GameEngine } from '@/systems/GameEngine';
import { useGameStore } from '@/store/gameState';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const gameGrid = useGameStore(state => state.gameState.grid);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    engineRef.current = new GameEngine(canvasRef.current);
    
    return () => {
      engineRef.current?.destroy();
    };
  }, []);
  
  useEffect(() => {
    if (!engineRef.current || !gameGrid) return;
    engineRef.current.updateEntities(gameGrid.entities);
  }, [gameGrid]);
  
  return (
    <div 
      ref={canvasRef} 
      className="w-full h-full bg-black"
      style={{ aspectRatio: '4/3' }}
    />
  );
};
