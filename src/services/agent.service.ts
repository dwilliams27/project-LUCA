import { PromptService } from "@/services/prompt.service";
import { GameServiceLocator, LocatableGameService } from "@/services/service-locator";
import { AGENT_ID, CAPABILITY_ID, genId } from "@/utils/id";
import { agentStore, dimensionStore, useGameStore } from "@/store/game-store";
import { AGENT_DAMP, AGENT_RANDOM_MOTION, BASE_AGENT_INVENTORY_HEIGHT, BASE_AGENT_INVENTORY_WIDTH, BASE_AGENT_SPEED, CONTEXT } from "@/utils/constants";
import { ToolService } from "@/services/tool.service";
import { MOVE_GRID_CELL_TOOL } from "@/ai/tools/move-grid-cell.tool";
import { CELL_AGENT_PROMPT } from "@/ai/prompts/cell-agent.prompt";
import { COLLECT_RESOURCE_GOAL_PROMPT } from "@/ai/prompts/collect-resource-goal.prompt";
import { IpcService } from "@/services/ipc.service";
import { CELL_AGENT_SYSTEM_PROMPT } from "@/ai/prompts/cell-agent.system-prompt";
import { GATHER_RESOURCE_TOOL } from "@/ai/tools/gather-resource.tool";
import { CONVERT_MATTER_TO_SIZE_TOOL } from "@/ai/tools/convert-matter-to-size.tool";
import { TextService } from "@/services/text.service";
import { CollisionService } from "@/services/physics.service";
import { generateEmptyResourceBucket } from "@/utils/resources";
import { applyAgentUpdates } from "@/utils/state";
import { GROWTH_GOAL_PROMPT } from "@/ai/prompts/growth-goal.prompt";

import type { GameState } from "@/store/game-store";
import type { Position } from "@/services/types/physics.service.types";
import { AGENT_MODEL, type Agent, type AgentModel, type AgentPhysicsUpdate, type Capability, type Goal } from "@/services/types/agent.service.types";
import { ResourceQuality, ResourceType } from "@/services/types/inventory.service.types";
import type { DeepPartial } from "@/types/utils";
import type { LucaTool } from "@/services/types/tool.service.types";
import type { IpcLlmChatResponse, ModelConfig } from "@/types/ipc-shared";

const DEBUG_MAX_DECISIONS = 20;

export class AgentService extends LocatableGameService {
  static name = "AGENT_SERVICE";
  private systemMessage: string;
  private debugTotalDecisions = 0;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    const baseSystemPrompt = serviceLocator.getService(PromptService).getBasePrompt(CELL_AGENT_SYSTEM_PROMPT);
    this.systemMessage = baseSystemPrompt.text;
  }

  private createKnownCellsGrid(position: Position, size: number): number[][] {
    const grid = Array(size).fill(0).map(() => Array(size).fill(0));
    grid[position.y][position.x] = 1;
    return grid;
  }

  createAgent(position: Position, modelConfigs: Record<AgentModel, ModelConfig>) {
    const promptService = this.serviceLocator.getService(PromptService);
    const toolService = this.serviceLocator.getService(ToolService);
    const textService = this.serviceLocator.getService(TextService);
    const cellSize = dimensionStore.getState().cellSize;

    const capabilities: Capability[] = [
      {
        id: genId(CAPABILITY_ID),
        description: "Basic movement, resource gathering, and matter conversion for growth.",
        tools: [
          toolService.getTool(GATHER_RESOURCE_TOOL),
          toolService.getTool(MOVE_GRID_CELL_TOOL),
          toolService.getTool(CONVERT_MATTER_TO_SIZE_TOOL),
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
      },
      {
        basePrompt: promptService.getBasePrompt(GROWTH_GOAL_PROMPT),
        basePriority: 1,
        requiredContext: [],
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
        activeModelConfigs: modelConfigs,
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
        items: Array(BASE_AGENT_INVENTORY_HEIGHT).fill(null).map(() => Array(BASE_AGENT_INVENTORY_WIDTH).fill(null)),
      },
      stats: {
        inventoryDerivedStats: {},
        currentStats: {
          MAX_HEALTH: 100,
          CUR_HEALTH: 100,
          DAMAGE_TICK: 0,
          DEFENCE: 0,
          SPEED: BASE_AGENT_SPEED
        }
      }
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
      
      if (agentRef.physics.moving) {
        this.updateMovingAgent(delta, physicsUpdate, agentRef);
      } else {
        if (!agentRef.mental.thinking && agentRef.mental.readyToThink && this.debugTotalDecisions < DEBUG_MAX_DECISIONS) {
          console.log("Making a decision...", agentRef);
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
        this.tickItems(physicsUpdate, agentRef);
      }

      this.agentVisualSync(pixiRef, physicsUpdate.position);
      updates[agentRef.id].physics = physicsUpdate as Agent["physics"];
    });

    applyAgentUpdates(updates);
  }

  tickItems(physicsUpdate: AgentPhysicsUpdate, agentRef: Agent) {
    agentRef.inventory.items.flat(2).filter((item) => !!item).forEach((item) => {
      if (item.pixi) {
        item.pixi.mainText.x = physicsUpdate.position.x + item.pixi.xOffset;
        item.pixi.mainText.y = physicsUpdate.position.y + item.pixi.yOffset;
      }
    });
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
    if (!agentRef.physics.destinationPos || !agentRef.physics.destinationCell) {
      physicsUpdate.moving = false;
      return;
    }

    const dx = agentRef.physics.destinationPos.x - physicsUpdate.position.x;
    const dy = agentRef.physics.destinationPos.y - physicsUpdate.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      physicsUpdate.position = agentRef.physics.destinationPos as Position;
      physicsUpdate.moving = false;
      physicsUpdate.currentCell = agentRef.physics.destinationCell!;
      physicsUpdate.destinationCell = null;
      physicsUpdate.destinationPos = null;
    } else {
      physicsUpdate.position.x += (dx / dist) * BASE_AGENT_SPEED * deltaTime;
      physicsUpdate.position.y += (dy / dist) * BASE_AGENT_SPEED * deltaTime;
    }
  }

  async makeDecision(agentRef: Agent) {
    agentRef.pixi.thoughtBubble.visible = true;
    agentRef.pixi.thoughtEmoji.visible = true;

    const promptService = this.serviceLocator.getService(PromptService);
    const toolService = this.serviceLocator.getService(ToolService);
    const ipcService = this.serviceLocator.getService(IpcService);
    
    // Check if LLM is disabled via debug settings
    const { disableLlm } = useGameStore.getState().debug;
    
    if (disableLlm) {
      console.log('LLM is disabled in debug settings, skipping LLM call');
      const mockResponse: IpcLlmChatResponse = {
        text: "<summary>Debug mode - LLM disabled</summary>",
        toolCalls: [],
        modelConfig: agentRef.mental.activeModelConfigs[AGENT_MODEL.MAIN_THOUGHT]
      };
      this.handleLlmResponse(agentRef.id, [], mockResponse, {});
      return;
    }

    const tools = agentRef.capabilities.map((capability) => capability.tools).flat();
    const context = {
      [CONTEXT.AGENT_ID]: agentRef.id,
      [CONTEXT.RESOURCE_STACK]: {
        type: ResourceType.ENERGY,
        quantity: 100,
        quality: ResourceQuality.LOW,
      }
    };

    const agentPrompt = promptService.getBasePrompt(CELL_AGENT_PROMPT);
    try {
      const response = await ipcService.llmChat({
        modelConfig: agentRef.mental.activeModelConfigs[AGENT_MODEL.MAIN_THOUGHT],
        tools: toolService.lucaToolsToAiTools(tools),
        system: this.systemMessage,
        prompt: promptService.constructPromptText(agentPrompt, context),
      });
      this.handleLlmResponse(agentRef.id, tools, response, context);
    } catch (error) {
      console.error('Error invoking IPC llmChat:', error);
    }
  }

  handleLlmResponse(agentId: string, tools: LucaTool[], response: IpcLlmChatResponse, context: Record<string, any>) {
    const agentRef = agentStore.getState().agentMap[agentId];
    const mentalUpdate: DeepPartial<Agent["mental"]> = {
      thinking: false,
    };
    mentalUpdate.recentThoughts = [...agentRef.mental.recentThoughts];
    const summaryMatch = response.text.match(/<summary>(.*?)<\/summary>/s);
    const thoughtText = summaryMatch ? summaryMatch[1].trim() : response.text;
    
    mentalUpdate.recentThoughts.push({ text: thoughtText, modelConfig: response.modelConfig });
    
    if (mentalUpdate.recentThoughts.length > 5) {
      mentalUpdate.recentThoughts.shift();
    }
    if (agentRef.pixi.thoughtEmoji) {
      agentRef.pixi.thoughtEmoji.visible = true;
      agentRef.pixi.thoughtEmoji.text = [...response.text][0];
    }

    response.toolCalls.forEach((toolCall) => {
      const invokedTool = tools.find((tool) => tool.name === toolCall.toolName);
      if (invokedTool) {
        console.log(`Invoking ${invokedTool.name} with:`, toolCall.args);
        invokedTool.implementation(toolCall.args, this.serviceLocator, context);
      }
    });

    this.debugTotalDecisions += 1;
    applyAgentUpdates({ [agentRef.id]: { mental: mentalUpdate } } as any, 'AgentService');

    return;
  }
}
