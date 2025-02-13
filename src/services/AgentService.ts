import { Goal, GoalService } from "@/services/GoalService";
import { PromptService } from "@/services/PromptService";
import { Capability } from "@/services/capabilities/CapabilityService";
import { LocatableGameService } from "@/services/ServiceLocator";
import { Position } from "@/types";
import { AGENT_ID, genId } from "@/utils/id";
import { dimensionStore } from "@/store/gameStore";
import { BASE_AGENT_SPEED } from "@/utils/constants";
import { Sprite } from "pixi.js";
import { GLOBAL_TEXTURES, TextureService } from "@/services/TextureService";
import { SpriteService } from "@/services/SpriteService";

export type AgentType = "Orchestrator";

export interface Agent {
  id: string;
  type: AgentType;
  goals: Goal[];
  capabilities: Capability[];
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

  createAgent(position: Position, goals: string[]) {
    const goalService = this.serviceLocator.getService(GoalService);
    const textureService = this.serviceLocator.getService(TextureService);
    const spriteService = this.serviceLocator.getService(SpriteService);
    const cellSize = dimensionStore.getState().cellSize;

    const id = genId(AGENT_ID);
    const agent: Agent = {
      id,
      type: "Orchestrator",
      goals: goals.map((goal) => goalService.getBaseGoal(goal)),
      capabilities: [], //TODO
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

  tick(delta: number) {
    Object.keys(this.agents).forEach((key) => {
      const agent = this.agents[key];
      if (agent.moving) {
        this.updateMovingAgent(delta, agent);
      } else if (!agent.thinking) {
        agent.thinking = true;
        this.makeDecision(agent);
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

  makeDecision(agent: Agent) {
    // TODO IMPLEMENT
    const promptService = this.serviceLocator.getService(PromptService);
  }
}
