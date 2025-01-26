import { GridCell } from "@/components/game/GridCell";
import { VGridCell } from "@/types";
import { Container, Graphics } from '@pixi/react';
import { useCallback } from "react";

export const Grid: React.FC<{
  zIndex: number;
  cells: VGridCell[][];
  width: number;
  height: number;
}> = ({ zIndex, cells, width, height }) => {
  const cellWidth = width / cells[0].length;
  const cellHeight = height / cells.length;

  const drawGrid = useCallback((g) => {
    g.clear();
    g.lineStyle(1, 0x00FF00);

    for (let yIndex = 0; yIndex <= cells.length; yIndex += 1) {
      g.moveTo(0, yIndex * cellHeight);
      g.lineTo(width, yIndex * cellHeight);
    }
    for (let xIndex = 0; xIndex <= cells[0].length; xIndex += 1) {
      g.moveTo(xIndex * cellWidth, 0);
      g.lineTo(xIndex * cellWidth, height);
    }
  }, [width, height]);

  return (
    <Container zIndex={zIndex} >
      <Graphics draw={drawGrid} zIndex={1} />
      <Container>
        {
          cells.map((row, yIndex) =>
            row.map((cell, xIndex) => (
              <GridCell
                key={`${xIndex}-${yIndex}`}
                cell={cell}
              />
            ))
          )
        }
      </Container>
    </Container>
  );
};
