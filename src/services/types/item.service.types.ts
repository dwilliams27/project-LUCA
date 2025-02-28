export enum ResourceType {
  ENERGY = 1,
  MATTER = 2,
  INFORMATION = 3
}

export enum ResourceQuality {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

export interface Resource {
  id: string;
  type: ResourceType;
  quantity: number;
  quality: ResourceQuality;
}

export interface ResourceStack {
  type: ResourceType;
  quantity: number;
  quality: ResourceQuality;
}
