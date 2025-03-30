import { GameServiceLocator } from "@/services/service-locator";
import { agentStore, gridStore } from "@/store/game-store";
import { CONTEXT, GRID_SIZE } from "@/utils/constants";
import { cellToPossibleAdjacent, resourceToStr } from "@/utils/context";

import type { ContextAdapter } from "@/services/types/prompt.service.types";
import { ResourceType } from "@/services/types/inventory.service.types";
import type { GridCell, Position } from "@/services/types/physics.service.types";

function getCellContextRepresentation(cell: GridCell) {
  const resources = [
    ...cell.resourceBuckets[ResourceType.ENERGY].flat(),
    ...cell.resourceBuckets[ResourceType.MATTER].flat(),
    ...cell.resourceBuckets[ResourceType.INFORMATION].flat(),
  ];
  const resourceStr = `${resources.length > 0 ? resources.map((resource) => resourceToStr(resource)).filter((resourceStr) => !!resourceStr).join('|') : 'EMPTY'}`;
  const adj = cellToPossibleAdjacent(cell.position);

  return `<c pos="${cell.position.x},${cell.position.y}"><rec>${resourceStr}</rec><adj>${adj}</adj></c>`
}

function getMoveOptionsContextRepresentation(position: Position, knownCells: number[][]) {
  const up = position.y > 0 ? { label: 'U', pos: { x: position.x, y: position.y - 1 }} : null;
  const right = position.x + 1 < GRID_SIZE ? { label: 'R', pos: { x: position.x + 1, y: position.y }} : null;
  const down = position.y + 1 < GRID_SIZE ? { label: 'D', pos: { x: position.x, y: position.y + 1 }} : null;
  const left = position.x > 0 ? { label: 'L', pos: { x: position.x - 1, y: position.y }} : null;
  return [up, right, down, left].filter((dir) => !!dir).map((dir) => {
    if (dir === null) {
      return null;
    }
    return `<opt dir="${dir.label}" pos="${dir.pos.x},${dir.pos.y}" status="${knownCells[dir.pos.y][dir.pos.x] === 1 ? 'known' : 'unexplored'}"</opt>`
  }).join('\n');
}

export const GridContextAdapter: ContextAdapter = {
  name: "GRID_CONTEXT_ADAPTER",
  templateString: "GRID",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentRef = agentStore.getState().agentMap[agentId];
    const cellsRef = gridStore.getState().cells;
    const knownCells: Position[] = [];
    for (let y = 0; y < cellsRef.length; y++) {
      for (let x = 0; x < cellsRef[y].length; x++) {
        if (agentRef.mental.knownCells[y][x] === 1) {
          knownCells.push({ x, y });
        }
      }
    }
    let text = `
<grid_context>
You exist in a NxN 2D grid.
You can move Up (U), Down (D), Left (L), or Right (R).
You will be given information about the contents of the cells (<c>) you have explored, whether those cells have adjacent cells (<adj>), and your options of where you can move to next (<opt>).
Positions will be given in "x,y" format, with "0,0" referring to the upper left corner of the grid.

Grid cells may contain resources (<rec>) of three types: Matter (M), Energy (E), and Information (I).
Each resource has a quality level (0=low, 1=medium, 2=high) shown in parentheses.
The quantity of each resource is indicated after the "x" symbol.
Multiple resources within a cell are separated by "|" characters.

Example notations:
EXAMPLE 1: <c pos="3,3"><rec>M(1)x1|I(2)x1</rec><adj>U,L</adj></c> = Cell at position 3,3 with 1 medium-quality Matter unit and 1 high-quality Information unit and adjacent cells Up and Left
EXAMPLE 2: <c pos="1,1"><rec>E(0)x3</rec><adj>U,R,D,L</adj></c> = Cell at position 1,1 with 3 low-quality Energy units and adjacent cells Up, Right, Down, and Left

<grid dimensions="${cellsRef.length}x${cellsRef.length}" current_position="${agentRef.physics.currentCell.x},${agentRef.physics.currentCell.y}">
<known_cells>
${knownCells.map((cellPosition) => getCellContextRepresentation(cellsRef[cellPosition.y][cellPosition.x])).join('\n')}
</known_cells>
<move_options>
${getMoveOptionsContextRepresentation(agentRef.physics.currentCell, agentRef.mental.knownCells)}
</move_options>
</grid>
</grid_context>
`;
    return text;
  }
}
