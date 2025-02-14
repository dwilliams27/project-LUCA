import { Agent } from "@/services/AgentService";
import type { ContextAdapter } from "@/services/PromptService";
import { GameState } from "@/store/gameStore";
import { ResourceType } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { resourceToStr } from "@/utils/context";

export const GridContextAdapter: ContextAdapter = {
  name: "GRID_CONTEXT_ADAPTER",
  templateString: "GRID",
  requiredContext: [
    CONTEXT.AGENT_OBJECT,
  ],
  getText: (gameState: GameState, context: Record<string, any>) => {
    const agent = context[CONTEXT.AGENT_OBJECT] as unknown as Agent;
    let text = `
      <grid_context>
      Known grid cells will have information about resources within them, and unknown grid cells will just be '[X]'
      Each known grid cell will be in the format [RESOURCE|RESOURCE|RESOURCE|...]
      The grid cell you are currently in will have a !
      
      <grid_state>
    `;
    for (let y = 0; y < gameState.grid.cells.length; y++) {
      const row: string[] = [];
      for (let x = 0; x < gameState.grid.cells[y].length; x++) {
        if (agent.knownCells[y][x] === 1) {
          const resources = [
            ...gameState.grid.cells[y][x].resourceBuckets[ResourceType.ENERGY].flat(),
            ...gameState.grid.cells[y][x].resourceBuckets[ResourceType.MATTER].flat(),
            ...gameState.grid.cells[y][x].resourceBuckets[ResourceType.INFORMATION].flat(),
          ];
          row.push(`[${agent.currentCell.x === x && agent.currentCell.y === y ? '!|' : ''}${resources.map((resource) => resourceToStr(resource)).filter((resourceStr) => !!resourceStr).join('|')}]`);
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
