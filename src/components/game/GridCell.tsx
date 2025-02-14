import { useGridStore } from '@/store/gameStore';
import { useTextStore } from '@/store/textStore';
import { GridCell } from '@/types';
import { Container, Graphics, Text } from '@pixi/react';

export const GridCellComponent: React.FC<{
  cell: GridCell;
}> = ({ cell }) => {
  const { getCellBounds } = useGridStore();
  const { textStyles } = useTextStore();
  const bounds = getCellBounds(cell.position);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  return (
    <Container
      x={bounds.left}
      y={bounds.top}
    >
      {/* Background */}
      {/* <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0xE3F2FD);
          g.lineStyle(2, 0xD3D3D3);
          g.drawRect(0, 0, width, height);
          g.endFill();
        }}
      /> */}
      
      {/* Coordinates */}
      {/* <Text
        text={`${cell.position.x},${cell.position.y}`}
        style={textStyles[TextStyles.TITLE_STD]}
        x={4}
        y={4}
      /> */}
    </Container>
  );
};
