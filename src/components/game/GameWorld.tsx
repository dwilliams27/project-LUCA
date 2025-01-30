import { Grid } from "@/components/game/Grid";
import { useGameStore, useGridStore } from "@/store/gameStore";
import { ParticleRenderer } from "@/systems/Particles/ParticleRenderer";
import { Container } from "@pixi/react";

export const GameWorld: React.FC<{ onResize: number }> = ({ onResize }) => {
  const { dimensions } = useGameStore();
  const grid = useGridStore();

  return (
    <Container sortableChildren>
      <Grid cells={grid.cells} width={dimensions.gridLength} height={dimensions.gridLength} zIndex={0}  />
      <ParticleRenderer zIndex={1} onResize={onResize} />
    </Container>
  );
};
