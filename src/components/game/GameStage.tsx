import { GameState } from "@/types";
import { Stage, Container, Sprite, useTick } from "@pixi/react";
import { useState } from "react";

interface GameStageProps {
  gameState: GameState;
  onUpdate: (state: Partial<GameState>) => void;
}

export const GameStage: React.FC<GameStageProps> = ({ gameState, onUpdate }) => {
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      options={{ backgroundColor: 0x000000 }}
    >
      
    </Stage>
  )
}
