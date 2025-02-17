import type { ContextAdapter } from "@/services/PromptService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { agentStore, gridStore } from "@/store/gameStore";
import { ResourceType } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { resourceToStr } from "@/utils/context";

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
    let text = `
<grid_context>
Known grid cells will have information about resources within them, and unknown grid cells will just be '[X]'
Each grid cell can have many different types of resources and qualities within it.
Each known grid cell will be in the format [RESOURCE|RESOURCE|RESOURCE|...]
The grid cell you are currently in will have a !, such as [!|RESOURCE|...]
<grid_state>
    `;
    for (let y = 0; y < cellsRef.length; y++) {
      const row: string[] = [];
      for (let x = 0; x < cellsRef[y].length; x++) {
        if (agentRef.mental.knownCells[y][x] === 1) {
          const resources = [
            ...cellsRef[y][x].resourceBuckets[ResourceType.ENERGY].flat(),
            ...cellsRef[y][x].resourceBuckets[ResourceType.MATTER].flat(),
            ...cellsRef[y][x].resourceBuckets[ResourceType.INFORMATION].flat(),
          ];
          row.push(`[${agentRef.physics.currentCell.x === x && agentRef.physics.currentCell.y === y ? '!|' : ''}${resources.map((resource) => resourceToStr(resource)).filter((resourceStr) => !!resourceStr).join('|')}]`);
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
