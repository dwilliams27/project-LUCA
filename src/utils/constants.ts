// UI Constants
export const WINDOW_MIN_WIDTH = 900;
export const WINDOW_MIN_HEIGHT = 670;
export const GRID_SIZE = 6;
export const INIT_CANVAS_WIDTH = 800;
export const INIT_CANVAS_HEIGHT = 600;
export const MAX_RESOURCES = 100;

// Text styles
export const TextStyles = {
  TITLE_STD: "TITLE_STD"
} as const;

// Particles
export const PARTICLE_SPEED = 0.3;
export const PARTICLE_TRAVEL_SPEED = 5;
export const PARTICLE_BASE_RADIUS = 2;
export const PARTICLE_DAMP = 0.98;
export const SNAP_DISTANCE = 5;

// Agents
export const AGENT_RANDOM_MOTION = 0.05;
export const AGENT_DAMP = 0.95;
export const BASE_AGENT_SPEED = 10;
export const BASE_AGENT_INVENTORY_WIDTH = 4;
export const BASE_AGENT_INVENTORY_HEIGHT = 4;
export const CONTEXT = {
  RESOURCE_STACK: "RESOURCE_STACK",
  AGENT_ID: "AGENT_ID",
}
export const DAMAGE_CHARGE_MAX = 60; // Since pixi runs at 60 FPS

// UI
export const UI_Z_PANEL = 100;