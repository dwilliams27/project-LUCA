import { Prompt, PromptService } from "@/services/PromptService";
import { LocatableGameService } from "@/services/ServiceLocator";
import { Position, ResourceQuality, ResourceType } from "@/types";
import { AGENT_ID, CAPABILITY_ID, genId } from "@/utils/id";
import { dimensionStore, GameState } from "@/store/gameStore";
import { BASE_AGENT_SPEED, CONTEXT } from "@/utils/constants";
import { Sprite } from "pixi.js";
import { GLOBAL_TEXTURES, TextureService } from "@/services/TextureService";
import { SpriteService } from "@/services/SpriteService";
import { LucaTool, ToolService } from "@/services/ToolService";
import { MOVE_GRID_CELL_TOOL } from "@/ai/tools/MoveGridCellTool";
import { SENSE_ADJACENT_CELL_TOOL } from "@/ai/tools/SenseAdjacentCellTool";
import { CELL_AGENT_PROMPT } from "@/ai/prompts/CellAgentPrompt";
import { COLLECT_RESOURCE_GOAL_PROMPT } from "@/ai/prompts/CollectResourceGoalPrompt";
import { IpcService } from "@/services/IpcService";

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
  knownCells: number[][];
  sprite: Sprite;
  position: Position;
  currentCell: Position;
  destinationCell: Position | null;
  destinationPos: Position | null;
  moving: boolean;
  thinking: boolean;
}

export class AgentService extends LocatableGameService {
  static name = "AGENT_SERVICE";
  private agents: Record<string, Agent> = {};

  private createKnownCellsGrid(position: Position, size: number): number[][] {
    const grid = Array(size).fill(0).map(() => Array(size).fill(0));
    grid[position.y][position.x] = 1;
    return grid;
  }

  createAgent(position: Position) {
    const promptService = this.serviceLocator.getService(PromptService);
    const textureService = this.serviceLocator.getService(TextureService);
    const spriteService = this.serviceLocator.getService(SpriteService);
    const toolService = this.serviceLocator.getService(ToolService);
    const cellSize = dimensionStore.getState().cellSize;

    const capabilities: Capability[] = [
      {
        id: genId(CAPABILITY_ID),
        description: "Basic movement and sensing",
        tools: [
          toolService.getTool(MOVE_GRID_CELL_TOOL),
          toolService.getTool(SENSE_ADJACENT_CELL_TOOL)
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
      recentThoughts: [],
      capabilities,
      knownCells: this.createKnownCellsGrid(position, dimensionStore.getState().gridLength),
      sprite: spriteService.createSprite(id, textureService.getTexture(GLOBAL_TEXTURES.DEBUG_AGENT)),
      position: { x: position.x * cellSize + Math.random() * cellSize, y: position.y * cellSize + Math.random() * cellSize },
      currentCell: { x: position.x, y: position.y },
      destinationCell: null,
      destinationPos: null,
      moving: false,
      thinking: false
    }
    this.agents[agent.id] = agent;
    return agent;
  }

  tick(delta: number, gameState: GameState) {

    Object.keys(this.agents).forEach((key) => {
      const agent = this.agents[key];
      if (agent.moving) {
        this.updateMovingAgent(delta, agent);
      } else if (!agent.thinking) {
        agent.thinking = true;
        this.makeDecision(agent, gameState);
      }
    })
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

    agent.sprite.x = agent.position.x;
    agent.sprite.y = agent.position.y;
  }

  async makeDecision(agent: Agent, gameState: GameState) {
    const promptService = this.serviceLocator.getService(PromptService);
    const toolService = this.serviceLocator.getService(ToolService);
    const ipcService = this.serviceLocator.getService(IpcService);

    const tools = agent.capabilities.map((capability) => capability.tools).flat();
    const context = {
      [CONTEXT.AGENT_OBJECT]: agent,
      [CONTEXT.PROMPT_SERVICE]: promptService,
      [CONTEXT.RESOURCE_STACK]: {
        type: ResourceType.ENERGY,
        quantity: 10,
        quality: ResourceQuality.LOW,
      }
    };

    const agentPrompt = promptService.getBasePrompt(CELL_AGENT_PROMPT);
    const promptText = promptService.constructPromptText(agentPrompt, gameState, context);
    
    try {
      const response = await ipcService.llmChat({
        query: promptText,
        tools: toolService.getAnthropicRepresentation(tools)
      });
      console.log('IPC Response', response);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
