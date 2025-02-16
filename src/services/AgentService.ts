import { Prompt, PromptService } from "@/services/PromptService";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { LucaMessage, Position, Resource, ResourceQuality, ResourceType } from "@/types";
import { AGENT_ID, CAPABILITY_ID, genId } from "@/utils/id";
import { agentStore, dimensionStore, GameState } from "@/store/gameStore";
import { AGENT_RANDOM_MOTION, BASE_AGENT_SPEED, CONTEXT } from "@/utils/constants";
import { Sprite, Text } from "pixi.js";
import { LucaTool, ToolService } from "@/services/ToolService";
import { MOVE_GRID_CELL_TOOL } from "@/ai/tools/MoveGridCellTool";
import { SENSE_ADJACENT_CELL_TOOL } from "@/ai/tools/SenseAdjacentCellTool";
import { CELL_AGENT_PROMPT } from "@/ai/prompts/CellAgentPrompt";
import { COLLECT_RESOURCE_GOAL_PROMPT } from "@/ai/prompts/CollectResourceGoalPrompt";
import { IpcService } from "@/services/IpcService";
import { CELL_AGENT_SYSTEM_PROMPT } from "@/ai/prompts/CellAgentSystemPrompt";
import { GATHER_RESOURCE_TOOL } from "@/ai/tools/GatherResourceTool";
import { TextService } from "@/services/TextService";

export type AgentType = "Orchestrator";

export interface Goal {
  basePrompt: Prompt | null;
  basePriority: number;
  requiredContext: string[];
  getFocusRank: (gameState: GameState, context: Record<string, any>) => number;
}

export interface Capability {
  id: string;
  description: string;
  tools: LucaTool[];
}

export interface Agent {
  id: string;
  type: AgentType;
  goals: Goal[];
  capabilities: Capability[];
  recentThoughts: string[];
  resourceBuckets: {
    [key in ResourceType]: Resource[];
  }, 
  knownCells: number[][];
  sprite: Sprite | null;
  displayText: Text;
  position: Position;
  vx: number;
  vy: number;
  currentCell: Position;
  destinationCell: Position | null;
  destinationPos: Position | null;
  moving: boolean;
  thinking: boolean;
  readyToThink: boolean;
}

export class AgentService extends LocatableGameService {
  static name = "AGENT_SERVICE";
  private systemMessage: LucaMessage;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    const baseSystemPrompt = serviceLocator.getService(PromptService).getBasePrompt(CELL_AGENT_SYSTEM_PROMPT);
    this.systemMessage = {
      role: "assistant",
      content: baseSystemPrompt.text
    }
  }

  private createKnownCellsGrid(position: Position, size: number): number[][] {
    const grid = Array(size).fill(0).map(() => Array(size).fill(0));
    grid[position.y][position.x] = 1;
    return grid;
  }

  createAgent(position: Position) {
    const promptService = this.serviceLocator.getService(PromptService);
    const toolService = this.serviceLocator.getService(ToolService);
    const textService = this.serviceLocator.getService(TextService);
    const cellSize = dimensionStore.getState().cellSize;

    const capabilities: Capability[] = [
      {
        id: genId(CAPABILITY_ID),
        description: "Basic movement, sensing, and resource gathering.",
        tools: [
          toolService.getTool(GATHER_RESOURCE_TOOL),
          toolService.getTool(MOVE_GRID_CELL_TOOL),
          toolService.getTool(SENSE_ADJACENT_CELL_TOOL),
        ]
      }
    ];

    const goals: Goal[] = [
      {
        basePrompt: promptService.getBasePrompt(COLLECT_RESOURCE_GOAL_PROMPT),
        basePriority: 1,
        requiredContext: [
          CONTEXT.RESOURCE_STACK
        ],
        getFocusRank: (gameState: GameState, context: Record<string, any>) => 1
      }
    ];

    const id = genId(AGENT_ID);
    const agent: Agent = {
      id,
      type: "Orchestrator",
      goals,
      resourceBuckets: {
        [ResourceType.ENERGY]: [],
        [ResourceType.MATTER]: [],
        [ResourceType.INFORMATION]: [],
      },
      recentThoughts: [],
      capabilities,
      knownCells: this.createKnownCellsGrid(position, dimensionStore.getState().gridLength),
      sprite: null,
      displayText: textService.createText("🤔", 32),
      position: { x: position.x * cellSize + Math.random() * cellSize, y: position.y * cellSize + Math.random() * cellSize },
      currentCell: { x: position.x, y: position.y },
      destinationCell: null,
      destinationPos: null,
      vx: 0,
      vy: 0,
      moving: false,
      thinking: false,
      readyToThink: true
    };
    agent.displayText.x = agent.position.x;
    agent.displayText.y = agent.position.y;
    agentStore.setState({
      agentMap: {
        ...agentStore.getState().agentMap,
        [agent.id]: agent
      }
    });

    return agent;
  }

  tick(delta: number) {
    // Note new agents created wont get ticked this cycle
    const agentIds = Object.keys(agentStore.getState().agentMap);
    agentIds.forEach((key) => {
      // Still some race condition-y things I think... revisit if problems
      const agent = agentStore.getState().agentMap[key];
      if (agent.moving) {
        this.updateMovingAgent(delta, agent);
      } else {
        if (!agent.thinking && agent.readyToThink) {
          agent.thinking = true;
          this.makeDecision(agent);
        }
        agent.vx += (Math.random() - 0.5) * AGENT_RANDOM_MOTION;
        agent.vy += (Math.random() - 0.5) * AGENT_RANDOM_MOTION;
      }
    });
  }

  updateMovingAgent(deltaTime: number, agent: Agent) {
    if (!agent.destinationPos || !agent.destinationCell) {
      agent.moving = false;
      return;
    }

    const dx = agent.destinationPos.x - agent.position.x;
    const dy = agent.destinationPos.y - agent.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      agent.moving = false;
      agent.currentCell = agent.destinationCell;
      agent.destinationCell = null;
      agent.destinationPos = null;
    } else {
      agent.position.x += (dx / dist) * BASE_AGENT_SPEED * deltaTime;
      agent.position.y += (dy / dist) * BASE_AGENT_SPEED * deltaTime;
    }

    agent.displayText.x = agent.position.x;
    agent.displayText.y = agent.position.y;
    if (agent.sprite) {
      agent.sprite.x = agent.position.x;
      agent.sprite.y = agent.position.y;
    }
  }

  async makeDecision(agent: Agent) {
    const promptService = this.serviceLocator.getService(PromptService);
    const toolService = this.serviceLocator.getService(ToolService);
    const ipcService = this.serviceLocator.getService(IpcService);

    const tools = agent.capabilities.map((capability) => capability.tools).flat();
    const context = {
      [CONTEXT.AGENT_ID]: agent.id,
      [CONTEXT.RESOURCE_STACK]: {
        type: ResourceType.ENERGY,
        quantity: 10,
        quality: ResourceQuality.LOW,
      }
    };

    const agentPrompt = promptService.getBasePrompt(CELL_AGENT_PROMPT);
    const userMessage: LucaMessage = {
      role: "user",
      content: promptService.constructPromptText(agentPrompt, context)
    }
    
    try {
      const response = await ipcService.llmChat({
        messages: [this.systemMessage, userMessage],
        tools: toolService.getAnthropicRepresentation(tools)
      });
      console.log('IPC Response', response);
    } catch (error) {
      console.error('Error invoking IPC llmChat:', error);
    }
  }
}
