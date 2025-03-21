import { GameServiceLocator } from "@/services/service-locator";
import { agentStore, gridStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";
import { resourceToStr } from "@/utils/context";

import type { ContextAdapter } from "@/services/types/prompt.service.types";
import { ResourceType } from "@/services/types/inventory.service.types";

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
Known grid cells will have information about resources within them, and unknown grid cells will just be '[X]'.
Remember you are in a 2D environment; you can move UP and DOWN to different rows.
You can gain information about what is in an unknown grid cell by moving there or sensing it.
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
          const resourceStr = `${agentRef.physics.currentCell.x === x && agentRef.physics.currentCell.y === y ? '!|' : ''}${resources.map((resource) => resourceToStr(resource)).filter((resourceStr) => !!resourceStr).join('|')}`;
          row.push(`[${resourceStr.length > 0 ? resourceStr : "EMPTY"}]`);
        } else {
          row.push(`[X]`);
        }
      }
      text += `<start_row>${row.join(' ')}<end_row>\n`;
    }
    text += "</grid_state>\n</grid_context>";
    return text;
  }
}
