import { GRID_PADDING, VGridCell } from '@/types';
import { Container, Graphics, Text } from '@pixi/react';

export const PixiGridCell: React.FC<{
  cell: VGridCell;
  size: number;
  x: number;
  y: number;
}> = ({ cell, size, x, y }) => {
  // Convert grid coordinates to screen coordinates
  const screenX = x * (size + GRID_PADDING);
  const screenY = y * (size + GRID_PADDING);

  // Calculate resource totals for visualization
  const resourceTotals = Object.values(cell.resourceBuckets)
    .flatMap(bucket => bucket.resources)
    .reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + resource.quantity;
      return acc;
    }, {} as Record<string, number>);

  return (
    <Container
      x={screenX}
      y={screenY}
    >
      {/* Background */}
      <Graphics
        draw={g => {
          g.clear();
          // Draw cell background
          g.beginFill(0xE3F2FD);
          g.lineStyle(1, 0xCCCCCC);
          g.drawRect(0, 0, size, size);
          g.endFill();

          // Draw resource indicators
          const barWidth = size / 3;
          const barHeight = 4;
          const padding = 4;

          // Energy bar (yellow)
          if (resourceTotals.RESOURCE_TYPE_ENERGY) {
            g.beginFill(0xFFEB3B);
            g.drawRect(padding, size - padding - 3 * (barHeight + 2), 
                      barWidth * Math.min(1, resourceTotals.RESOURCE_TYPE_ENERGY / 100), barHeight);
            g.endFill();
          }

          // Matter bar (blue)
          if (resourceTotals.RESOURCE_TYPE_MATTER) {
            g.beginFill(0x2196F3);
            g.drawRect(padding, size - padding - 2 * (barHeight + 2),
                      barWidth * Math.min(1, resourceTotals.RESOURCE_TYPE_MATTER / 100), barHeight);
            g.endFill();
          }

          // Information bar (green)
          if (resourceTotals.RESOURCE_TYPE_INFORMATION) {
            g.beginFill(0x4CAF50);
            g.drawRect(padding, size - padding - (barHeight + 2),
                      barWidth * Math.min(1, resourceTotals.RESOURCE_TYPE_INFORMATION / 100), barHeight);
            g.endFill();
          }
        }}
      />

      {/* Process indicators */}
      <Graphics
        draw={g => {
          g.clear();
          const processCount = cell.processes.length;
          if (processCount > 0) {
            g.beginFill(0x9C27B0, 0.5);
            g.drawCircle(size - 10, 10, 6);
            g.endFill();
          }
        }}
      />
      
      {/* Coordinates */}
      <Text
        text={`${cell.position.x},${cell.position.y}`}
        x={4}
        y={4}
      />
    </Container>
  );
};
