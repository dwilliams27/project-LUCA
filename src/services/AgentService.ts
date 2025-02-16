import { Prompt, PromptService } from "@/services/PromptService";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { IpcLlmChatResponse, LucaMessage, Position, Resource, ResourceQuality, ResourceType } from "@/types";
import { AGENT_ID, CAPABILITY_ID, genId, RESOURCE_ID } from "@/utils/id";
import { agentStore, dimensionStore, GameState } from "@/store/gameStore";
import { AGENT_DAMP, AGENT_RANDOM_MOTION, BASE_AGENT_SPEED, CONTEXT } from "@/utils/constants";
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
import { cloneWithMaxDepth } from "@/utils/helpers";
import { CollisionService } from "@/services/CollisionService";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { generateEmptyResourceBucket } from "@/utils/resources";

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
  display: {
    sprite: Sprite | null;
    mainText: Text;
    thoughtBubble: Text;
    thoughtEmoji: Text;
  },
  position: Position;
  vx: number;
  vy: number;
  width: number;
  height: number;
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
    const mainText = textService.createText("🤔", 32);
    const thoughtBubble = textService.createText("💭", 38, { x: -0.5, y: 1 });
    const thoughtEmoji = textService.createText("X", 38, { x: -0.5, y: 1 });
    mainText.zIndex = 2;
    thoughtBubble.visible = false;
    thoughtBubble.zIndex = 5;
    thoughtEmoji.visible = false;
    thoughtEmoji.zIndex = 6;
    const agentPosition = { x: position.x * cellSize + Math.random() * cellSize, y: position.y * cellSize + Math.random() * cellSize };
    mainText.x = agentPosition.x;
    mainText.y = agentPosition.y;
    thoughtBubble.x = agentPosition.x;
    thoughtBubble.y = agentPosition.y;

    const agent: Agent = {
      id,
      type: "Orchestrator",
      goals,
      resourceBuckets: {
        [ResourceType.ENERGY]: generateEmptyResourceBucket(ResourceType.ENERGY),
        [ResourceType.MATTER]: generateEmptyResourceBucket(ResourceType.MATTER),
        [ResourceType.INFORMATION]: generateEmptyResourceBucket(ResourceType.INFORMATION),
      },
      recentThoughts: [],
      capabilities,
      knownCells: this.createKnownCellsGrid(position, dimensionStore.getState().gridLength),
      display: {
        sprite: null,
        mainText,
        thoughtBubble,
        thoughtEmoji,
      },
      position: agentPosition,
      currentCell: { x: position.x, y: position.y },
      destinationCell: null,
      destinationPos: null,
      vx: 0,
      vy: 0,
      width: mainText.width,
      height: mainText.height,
      moving: false,
      thinking: false,
      readyToThink: true
    };
    
    agentStore.setState({
      agentMap: {
        ...agentStore.getState().agentMap,
        [agent.id]: agent
      }
    });

    return agent;
  }

  tick(delta: number) {
    const currentState = agentStore.getState();
    const agentMap = currentState.agentMap;
    const updates: Record<string, Agent> = {};

    Object.values(agentMap).forEach((agent) => {
      // May need to adjust cloning if changing nested props
      const updatedAgent = cloneWithMaxDepth(agent, 3);
      
      if (updatedAgent.moving) {
        this.updateMovingAgent(delta, updatedAgent);
      } else {
        if (!updatedAgent.thinking && updatedAgent.readyToThink) {
          updatedAgent.thinking = true;
          updatedAgent.readyToThink = false;
          this.makeDecision(updatedAgent);
        }
        updatedAgent.vx += (Math.random() - 0.5) * AGENT_RANDOM_MOTION;
        updatedAgent.vy += (Math.random() - 0.5) * AGENT_RANDOM_MOTION;
        updatedAgent.vx *= AGENT_DAMP;
        updatedAgent.vy *= AGENT_DAMP;
        this.tickAgentPos(delta, updatedAgent);
      }

      this.agentVisualSync(updatedAgent);
      updates[updatedAgent.id] = updatedAgent;
    });

    // Fine for now agents dont get updates on each other until next tick
    agentStore.setState({
      agentMap: {
        ...agentMap,
        ...updates
      }
    });
  }

  tickAgentPos(deltaTime: number, agent: Agent) {
    const collisionService = this.serviceLocator.getService(CollisionService);

    agent.position.x += agent.vx * BASE_AGENT_SPEED * deltaTime;
    agent.position.y += agent.vy * BASE_AGENT_SPEED * deltaTime;

    const { v, p } = collisionService.enforceGridCellBoundaries(agent.position, { x: agent.width, y: agent.height }, agent.currentCell);
    agent.position = p;
    agent.vx *= v.x;
    agent.vy *= v.y;
  }

  agentVisualSync(agent: Agent) {
    agent.display.mainText.x = agent.position.x;
    agent.display.mainText.y = agent.position.y;
    agent.display.thoughtBubble.x = agent.position.x;
    agent.display.thoughtBubble.y = agent.position.y;
    if (agent.display.sprite) {
      agent.display.sprite.x = agent.position.x;
      agent.display.sprite.y = agent.position.y;
    }
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
  }

  async makeDecision(agent: Agent) {
    agent.display.thoughtBubble.visible = true;
    agent.display.thoughtEmoji.text = "🤔";
    agent.display.thoughtEmoji.visible = true;

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
      this.handleLlmResponse(agent, tools, response, context);
    } catch (error) {
      console.error('Error invoking IPC llmChat:', error);
    }
  }

  handleLlmResponse(agent: Agent, tools: LucaTool[], response: IpcLlmChatResponse, context: Record<string, any>) {
    const thoughtContent = response.message.content.find((content) => 
      content.type === "text" && 
      content.text.length > 0 && 
      /\p{Emoji}/u.test(content.text[0])
    ) as TextBlock;

    if (thoughtContent) {
      agent.recentThoughts.push(thoughtContent.text);
      if (agent.recentThoughts.length > 5) {
        agent.recentThoughts.shift();
      }
      if (agent.display.thoughtEmoji) {
        agent.display.thoughtEmoji.text = thoughtContent.text.charAt(0);
      }
    }
    if (response.message.stop_reason === "tool_use") {
      const firstCall = response.message.content.find((content) => content.type === "tool_use");
      const invokedTool = tools.find((tool) => tool.name === firstCall?.name);

      if (firstCall && invokedTool) {
        console.log(`Invoking ${invokedTool.name} with:`, firstCall.input);
        invokedTool.implementation(firstCall.input, this.serviceLocator, context);
      }
    }
  }
}
