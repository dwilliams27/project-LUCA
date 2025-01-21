import { Position } from '@/generated/process';
import { EntityType } from '@/types';
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
  
  public destroy(): void {
    this.app.destroy(true);
  }
}
