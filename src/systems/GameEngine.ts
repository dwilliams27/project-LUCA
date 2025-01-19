import { EntityType, type GridEntity, type Position } from '@/types';
import * as PIXI from 'pixi.js';

export class GameEngine {
  private app: PIXI.Application;
  private gridContainer: PIXI.Container;
  private entities: Map<string, PIXI.Container>;
  private cellSize: number;
  private gridWidth: number;
  private gridHeight: number;
  
  constructor(canvas: HTMLDivElement) {
    // Initialize PIXI Application
    this.app = new PIXI.Application({
      resizeTo: canvas,
      backgroundColor: 0x0a0a0a,
      antialias: true
    });
    
    this.entities = new Map();
    this.gridWidth = 8;
    this.gridHeight = 6;
    this.cellSize = Math.min(
      this.app.screen.width / this.gridWidth,
      this.app.screen.height / this.gridHeight
    );
    
    canvas.appendChild(this.app.view as HTMLCanvasElement);
    
    // Create main container for the grid
    this.gridContainer = new PIXI.Container();
    this.app.stage.addChild(this.gridContainer);
    
    // Center the grid
    this.gridContainer.x = (this.app.screen.width - this.gridWidth * this.cellSize) / 2;
    this.gridContainer.y = (this.app.screen.height - this.gridHeight * this.cellSize) / 2;
    
    this.initializeGrid();
    this.setupEventListeners();
  }
  
  private initializeGrid(): void {
    // Draw grid background
    const gridBackground = new PIXI.Graphics();
    gridBackground.beginFill(0x1a1a1a);
    gridBackground.drawRect(0, 0, this.gridWidth * this.cellSize, this.gridHeight * this.cellSize);
    gridBackground.endFill();
    this.gridContainer.addChild(gridBackground);
    
    // Draw grid lines
    const gridLines = new PIXI.Graphics();
    gridLines.lineStyle(1, 0x333333);
    
    // Vertical lines
    for (let x = 0; x <= this.gridWidth; x++) {
      gridLines.moveTo(x * this.cellSize, 0);
      gridLines.lineTo(x * this.cellSize, this.gridHeight * this.cellSize);
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.gridHeight; y++) {
      gridLines.moveTo(0, y * this.cellSize);
      gridLines.lineTo(this.gridWidth * this.cellSize, y * this.cellSize);
    }
    
    this.gridContainer.addChild(gridLines);
  }
  
  private setupEventListeners(): void {
    // Make grid interactive
    this.gridContainer.interactive = true;
    
    // Handle cell clicks
    this.gridContainer.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      const localPos = event.getLocalPosition(this.gridContainer);
      const gridPos = this.pixelToGrid(localPos);
      this.handleGridClick(gridPos);
    });
  }
  
  private pixelToGrid(pixelPos: PIXI.Point): Position {
    return {
      x: Math.floor(pixelPos.x / this.cellSize),
      y: Math.floor(pixelPos.y / this.cellSize)
    };
  }
  
  private gridToPixel(gridPos: Position): PIXI.Point {
    return new PIXI.Point(
      gridPos.x * this.cellSize + this.cellSize / 2,
      gridPos.y * this.cellSize + this.cellSize / 2
    );
  }
  
  private handleGridClick(position: Position): void {
    console.log('Grid clicked:', position);
    // Implement selection and movement logic
  }
  
  public updateEntities(entities: GridEntity[]): void {
    // Clear old entities
    this.entities.forEach(entity => entity.destroy());
    this.entities.clear();
    
    // Create new entities
    entities.forEach(entity => {
      const container = this.createEntitySprite(entity);
      const pixelPos = this.gridToPixel(entity.position);
      container.x = pixelPos.x;
      container.y = pixelPos.y;
      this.gridContainer.addChild(container);
      this.entities.set(entity.id, container);
    });
  }
  
  private createEntitySprite(entity: GridEntity): PIXI.Container {
    const container = new PIXI.Container();
    
    // Create base shape
    const shape = new PIXI.Graphics();
    const radius = this.cellSize * 0.4;
    
    switch (entity.type) {
      case EntityType.PLAYER_ORGANISM:
        shape.beginFill(0x00ff00);
        shape.drawCircle(0, 0, radius);
        break;
      case EntityType.ENEMY:
        shape.beginFill(0xff0000);
        shape.drawPolygon([
          -radius, radius,
          0, -radius,
          radius, radius
        ]);
        break;
      case EntityType.RESOURCE_NODE:
        shape.beginFill(0x0000ff);
        shape.drawRect(-radius, -radius, radius * 2, radius * 2);
        break;
      default:
        shape.beginFill(0x808080);
        shape.drawCircle(0, 0, radius);
    }
    
    shape.endFill();
    container.addChild(shape);
    
    // Add health bar if entity has health
    if (entity.health !== undefined) {
      const healthBar = this.createHealthBar(entity);
      healthBar.y = -radius - 10;
      container.addChild(healthBar);
    }
    
    container.interactive = true;
    container.on('pointerdown', () => {
      console.log('Entity clicked:', entity);
      // Implement entity selection logic
    });
    
    return container;
  }
  
  private createHealthBar(entity: GridEntity): PIXI.Container {
    const container = new PIXI.Container();
    const width = this.cellSize * 0.8;
    const height = 4;
    
    // Background
    const background = new PIXI.Graphics();
    background.beginFill(0x333333);
    background.drawRect(-width/2, 0, width, height);
    background.endFill();
    
    // Health
    const healthWidth = (entity.health / entity.maxHealth) * width;
    const healthBar = new PIXI.Graphics();
    healthBar.beginFill(0x00ff00);
    healthBar.drawRect(-width/2, 0, healthWidth, height);
    healthBar.endFill();
    
    container.addChild(background, healthBar);
    return container;
  }
  
  public moveEntity(entityId: string, newPos: Position, animate: boolean = true): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    
    const pixelPos = this.gridToPixel(newPos);
    
    if (animate) {
      // Animate movement
      const duration = 200; // ms
      const startX = entity.x;
      const startY = entity.y;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        entity.x = startX + (pixelPos.x - startX) * progress;
        entity.y = startY + (pixelPos.y - startY) * progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      // Instant movement
      entity.x = pixelPos.x;
      entity.y = pixelPos.y;
    }
  }
  
  public shiftGridUp(): void {
    const duration = 500; // ms
    const startY = this.gridContainer.y;
    const targetY = startY + this.cellSize;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      this.gridContainer.y = startY + (targetY - startY) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Remove bottom row entities and add new row at top
        // This would be coordinated with the game state update
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  public destroy(): void {
    this.app.destroy(true);
  }
}
