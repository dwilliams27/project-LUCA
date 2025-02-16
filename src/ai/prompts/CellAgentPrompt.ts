import { CapabilitiesContextAdapter } from "@/ai/contextAdapters/CapabilitiesContextAdapter";
import { CurrentCellAgentResourcesContextAdapter } from "@/ai/contextAdapters/CurrentAgentResourcesContextAdapter";
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
<current_resources>
{{CELL_AGENT_RESOURCES}}
</current_resources>
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
    CurrentCellAgentResourcesContextAdapter,
    CapabilitiesContextAdapter,
    EnvironmentContextAdapter,
    GoalsContextAdapter,
  ],
  tools: [],
  version: "1.0.0"
}
