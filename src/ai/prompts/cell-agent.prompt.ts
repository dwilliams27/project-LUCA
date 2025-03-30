import { CapabilitiesContextAdapter } from "@/ai/contextAdapters/capabilities.context-adapter";
import { InventoryContextAdapter } from "@/ai/contextAdapters/inventory.context-adapter";
import { EnvironmentContextAdapter } from "@/ai/contextAdapters/environment.context-adapter";
import { GoalsContextAdapter } from "@/ai/contextAdapters/goals.context-adapter";
import { RecentThoughtsContextAdapter } from "@/ai/contextAdapters/recent-thoughts.context-adapter";

import type { Prompt } from "@/services/types/prompt.service.types";
import { AgentStatsContextAdapter } from "@/ai/contextAdapters/agent-stats.context-adapter";

export const CELL_AGENT_PROMPT = "CELL_AGENT_PROMPT";
export const CellAgentPrompt: Prompt = {
  name: CELL_AGENT_PROMPT,
  text: `
<recent_thoughts>
{{RECENT_THOUGHTS}}
</recent_thoughts>
<inventory>
{{INVENTORY}}
</inventory>
<stats>
{{AGENT_STATS}}
</stats>
<capabilities>
{{CAPABILITIES}}
</capabilities>
<environment_context>
{{ENVIRONMENT}}
</environment_context>
<goals>
{{GOALS}}
</goals>
  `,
  contextAdapters: [
    AgentStatsContextAdapter,
    RecentThoughtsContextAdapter,
    InventoryContextAdapter,
    CapabilitiesContextAdapter,
    EnvironmentContextAdapter,
    GoalsContextAdapter,
  ],
  tools: [],
  version: "1.0.0"
}
