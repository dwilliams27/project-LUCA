import type { ContextAdapter } from "@/services/PromptService";
import { GameState } from "@/store/gameStore";
import { Position, ResourceType } from "@/types";
import { resourceToStr } from "@/utils/context";

export const GridContextAdapter: ContextAdapter = {
  name: "GRID_CONTEXT_ADAPTER",
  requiredContext: [
    // 2D array with 1 for known, 0 for unknown. Must match grid size
    "KNOWN_CELLS",
    // Position
    "AGENT_LOCATION"
  ],
  getText: (gameState: GameState, context: Record<string, string>) => {
    const knownCells = context["KNOWN_CELLS"] as unknown as number[][];
    const agentLocation = context["AGENT_LOCATION"] as unknown as Position;
    let text = `
      <grid_context>
      Known grid cells will have information about resources within them, and unknown grid cells will just be '[X]'
      Each known grid cell will be in the format [TYPE,QUALITY,QUANTITY|TYPE,QUALITY,QUANTITY,...]
      The grid cell you are currently in will have a !
      Type: Matter = M, Energy = E, Information = I
      Quality: Low = 0, Medium = 1, High = 2
      Example row with 4 items: [M,0,10|E,1,1|E,2,3] [X] [X] [!|I,0,42|I,1,5]
      
      <grid_state>
    `;
    for (let y = 0; y < gameState.grid.cells.length; y++) {
      const row: string[] = [];
      for (let x = 0; x < gameState.grid.cells[y].length; x++) {
        if (knownCells[y][x] === 1) {
          const resources = [
            ...gameState.grid.cells[y][x].resourceBuckets[ResourceType.ENERGY].flat(),
            ...gameState.grid.cells[y][x].resourceBuckets[ResourceType.MATTER].flat(),
            ...gameState.grid.cells[y][x].resourceBuckets[ResourceType.INFORMATION].flat(),
          ];
          row.push(`[${agentLocation.x === x && agentLocation.y === y ? '!|' : ''}${resources.map((resource) => resourceToStr(resource)).filter((resourceStr) => !!resourceStr).join('|')}]`);
        } else {
          row.push(`[X]`);
        }
      }
      text += `${row.join(' ')}\n`;
    }
    text += "</grid_state>\n</grid_context>";
    return text;
  }
}
