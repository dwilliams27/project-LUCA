import { GRID_PADDING, VGridCell } from '@/types';
import { Container, Graphics, Text } from '@pixi/react';

export const PixiGridCell: React.FC<{
  cell: VGridCell;
  xIndex: number;
  yIndex: number;
  width: number;
  height: number;
}> = ({ cell, xIndex, yIndex, width, height }) => {
  const offsetX = xIndex * (width + GRID_PADDING);
  const offsetY = yIndex * (height + GRID_PADDING);

  return (
    <Container
      x={offsetX}
      y={offsetY}
    >
      {/* Background */}
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0xE3F2FD);
          // g.lineStyle(2, 0xD3D3D3);
          // g.drawRect(0, 0, width, height);
          g.endFill();
        }}
      />
      
      {/* Coordinates */}
      {/* <Text
        text={`${cell.position.x},${cell.position.y}`}
        x={4}
        y={4}
      /> */}
    </Container>
  );
};
