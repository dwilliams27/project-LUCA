import { CapabilitiesContextAdapter } from "@/ai/contextAdapters/CapabilitiesContextAdapter";
import { InventoryContextAdapter } from "@/ai/contextAdapters/InventoryContextAdapter";
import { EnvironmentContextAdapter } from "@/ai/contextAdapters/EnvironmentContextAdapter";
import { GoalsContextAdapter } from "@/ai/contextAdapters/GoalsContextAdapter";
import { RecentThoughtsContextAdapter } from "@/ai/contextAdapters/RecentThoughtsContextAdapter";
import type { Prompt } from "@/services/PromptService";

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
    RecentThoughtsContextAdapter,
    InventoryContextAdapter,
    CapabilitiesContextAdapter,
    EnvironmentContextAdapter,
    GoalsContextAdapter,
  ],
  tools: [],
  version: "1.0.0"
}
