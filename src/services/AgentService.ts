import { Prompt, PromptService } from "@/services/PromptService";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { DeepPartial, IpcLlmChatResponse, LucaMessage, Position, Resource, ResourceQuality, ResourceType } from "@/types";
import { AGENT_ID, CAPABILITY_ID, genId } from "@/utils/id";
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
import { applyAgentUpdates } from "@/utils/state";

export type AgentType = "Orchestrator";
export type AgentPhysicsUpdate = DeepPartial<Agent["physics"]> & { position: Position };

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
  // Dont clone and update these, let PIXI handle
  pixi: {
    sprite: Sprite | null;
    mainText: Text;
    thoughtBubble: Text;
    thoughtEmoji: Text;
  },
  physics: {
    position: Position;
    vx: number;
    vy: number;
    moving: boolean;
    currentCell: Position;
    destinationCell: Position | null;
    destinationPos: Position | null;
  },
  mental: {
    thinking: boolean;
    readyToThink: boolean;
    recentThoughts: string[];
    knownCells: number[][];
  },
  inventory: {
    resourceBuckets: {
      [key in ResourceType]: Resource[];
    },
  },
}

const DEBUG_MAX_DECISIONS = 5;

export class AgentService extends LocatableGameService {
  static name = "AGENT_SERVICE";
  private systemMessage: LucaMessage;
  private debugTotalDecisions = 0;

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
          // toolService.getTool(SENSE_ADJACENT_CELL_TOOL),
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
    const mainText = textService.createText("🤨", 32);
    const thoughtBubble = textService.createText("💭", 42, { x: -0.5, y: 1 });
    const thoughtEmoji = textService.createText("X", 24, { x: -1.20, y: 1.5 });
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
      capabilities,
      pixi: {
        sprite: null,
        mainText,
        thoughtBubble,
        thoughtEmoji,
      },
      physics: {
        position: agentPosition,
        vx: 0,
        vy: 0,
        currentCell: { x: position.x, y: position.y },
        destinationCell: null,
        destinationPos: null,
        moving: false,
      },
      mental: {
        thinking: false,
        readyToThink: true,
        recentThoughts: [],
        knownCells: this.createKnownCellsGrid(position, dimensionStore.getState().gridLength),
      },
      inventory: {
        resourceBuckets: {
          [ResourceType.ENERGY]: generateEmptyResourceBucket(ResourceType.ENERGY),
          [ResourceType.MATTER]: generateEmptyResourceBucket(ResourceType.MATTER),
          [ResourceType.INFORMATION]: generateEmptyResourceBucket(ResourceType.INFORMATION),
        },
      },
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
    const updates: Record<string, Partial<Agent>> = {};

    Object.values(agentMap).forEach((agentRef) => {
      updates[agentRef.id] = {};
      const physicsUpdate: AgentPhysicsUpdate = {
        position: { x: agentRef.physics.position.x, y: agentRef.physics.position.y }
      };
      const pixiRef = agentRef.pixi;
      
      if (physicsUpdate.moving) {
        this.updateMovingAgent(delta, physicsUpdate, agentRef);
        this.tickAgentPos(delta, physicsUpdate, agentRef);
      } else {
        if (!agentRef.mental.thinking && agentRef.mental.readyToThink && this.debugTotalDecisions < DEBUG_MAX_DECISIONS) {
          console.log('$$ Prethink agent state', agentRef);
          console.log("Making a decision...");
          const mentalUpdate: DeepPartial<Agent["mental"]> = {};
          mentalUpdate.thinking = true;
          mentalUpdate.readyToThink = false;
          updates[agentRef.id].mental = mentalUpdate as Agent["mental"];
          this.makeDecision(agentRef);
        }
        if (!physicsUpdate.vx || !physicsUpdate.vy) {
          physicsUpdate.vx = agentRef.physics.vx;
          physicsUpdate.vy = agentRef.physics.vy;
        }
        physicsUpdate.vx += (Math.random() - 0.5) * AGENT_RANDOM_MOTION;
        physicsUpdate.vy += (Math.random() - 0.5) * AGENT_RANDOM_MOTION;
        physicsUpdate.vx *= AGENT_DAMP;
        physicsUpdate.vy *= AGENT_DAMP;
        this.tickAgentPos(delta, physicsUpdate, agentRef);
      }

      this.agentVisualSync(pixiRef, physicsUpdate.position);
      // console.log('Agent mental updates', updates[agentRef.id]?.mental, agentRef.mental);
      updates[agentRef.id].physics = physicsUpdate as Agent["physics"];
    });

    applyAgentUpdates(updates);
  }

  tickAgentPos(deltaTime: number, physicsUpdate: AgentPhysicsUpdate, agentRef: Agent) {
    const collisionService = this.serviceLocator.getService(CollisionService);

    physicsUpdate.position.x += agentRef.physics.vx * BASE_AGENT_SPEED * deltaTime;
    physicsUpdate.position.y += agentRef.physics.vy * BASE_AGENT_SPEED * deltaTime;

    const { v, p } = collisionService.enforceGridCellBoundaries(physicsUpdate.position as Position, { x: agentRef.pixi.mainText.width, y: agentRef.pixi.mainText.height }, agentRef.physics.currentCell);
    physicsUpdate.position = p;
    if (!physicsUpdate.vx || !physicsUpdate.vy) {
      physicsUpdate.vx = agentRef.physics.vx;
      physicsUpdate.vy = agentRef.physics.vy;
    }
    physicsUpdate.vx *= v.x;
    physicsUpdate.vy *= v.y;
  }

  agentVisualSync(pixiRef: Agent["pixi"], position: Position) {
    pixiRef.mainText.x = position.x;
    pixiRef.mainText.y = position.y;
    pixiRef.thoughtBubble.x = position.x;
    pixiRef.thoughtBubble.y = position.y;
    pixiRef.thoughtEmoji.x = position.x;
    pixiRef.thoughtEmoji.y = position.y;
    if (pixiRef.sprite) {
      pixiRef.sprite.x = position.x;
      pixiRef.sprite.y = position.y;
    }
  }

  updateMovingAgent(deltaTime: number, physicsUpdate: AgentPhysicsUpdate, agentRef: Agent) {
    if (!physicsUpdate.destinationPos || !physicsUpdate.destinationCell) {
      physicsUpdate.moving = false;
      return;
    }

    const dx = physicsUpdate.destinationPos.x! - physicsUpdate.position.x;
    const dy = physicsUpdate.destinationPos.y! - physicsUpdate.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      physicsUpdate.moving = false;
      physicsUpdate.currentCell = physicsUpdate.destinationCell;
      physicsUpdate.destinationCell = null;
      physicsUpdate.destinationPos = null;
    } else {
      physicsUpdate.position!.x! += (dx / dist) * BASE_AGENT_SPEED * deltaTime;
      physicsUpdate.position!.y! += (dy / dist) * BASE_AGENT_SPEED * deltaTime;
    }
  }

  async makeDecision(agentRef: Agent) {
    agentRef.pixi.thoughtBubble.visible = true;
    agentRef.pixi.thoughtEmoji.text = "🤔";
    agentRef.pixi.thoughtEmoji.visible = true;

    const promptService = this.serviceLocator.getService(PromptService);
    const toolService = this.serviceLocator.getService(ToolService);
    const ipcService = this.serviceLocator.getService(IpcService);

    const tools = agentRef.capabilities.map((capability) => capability.tools).flat();
    const context = {
      [CONTEXT.AGENT_ID]: agentRef.id,
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
    };
    
    try {
      const response = await ipcService.llmChat({
        messages: [this.systemMessage, userMessage],
        tools: toolService.getAnthropicRepresentation(tools)
      });
      console.log('IPC Response', response);
      this.handleLlmResponse(agentRef.id, tools, response, context);
    } catch (error) {
      console.error('Error invoking IPC llmChat:', error);
    }
  }

  handleLlmResponse(agentId: string, tools: LucaTool[], response: IpcLlmChatResponse, context: Record<string, any>) {
    const thoughtContent = response.message.content.find((content) => 
      content.type === "text" && 
      content.text.length > 0
    ) as TextBlock;
    const agentRef = agentStore.getState().agentMap[agentId];
    const mentalUpdate: DeepPartial<Agent["mental"]> = {};

    if (thoughtContent) {
      mentalUpdate.recentThoughts = [...agentRef.mental.recentThoughts];
      mentalUpdate.recentThoughts.push(thoughtContent.text);
      if (mentalUpdate.recentThoughts.length > 5) {
        mentalUpdate.recentThoughts.shift();
      }
      if (agentRef.pixi.thoughtEmoji) {
        agentRef.pixi.thoughtEmoji.text = thoughtContent.text.charAt(0);
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

    mentalUpdate.thinking = false;

    this.debugTotalDecisions += 1;
    applyAgentUpdates({ [agentRef.id]: { mental: mentalUpdate } } as any, true);
  }
}
