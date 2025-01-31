import { Grid } from "@/components/game/Grid";
import { useDimensionStore, useGridStore } from "@/store/gameStore";
import { Container } from "@pixi/react";

export const GameWorld: React.FC<{}> = () => {
  const dimensions = useDimensionStore();
  const grid = useGridStore();

  return (
    <Container sortableChildren>
      <Grid cells={grid.cells} width={dimensions.gridLength} height={dimensions.gridLength} zIndex={0}  />
    </Container>
  );
};
