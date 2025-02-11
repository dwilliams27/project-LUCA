import { Application } from "pixi.js";

export abstract class LocatableService {
  serviceLocator: ServiceLocator;

  constructor(serviceLocator: ServiceLocator, public readonly name: string = (this.constructor as any).name) {
    if (!name) {
      throw new Error('Unable to initialize service; static name property must be defined for all services');
    }
    this.serviceLocator = serviceLocator;
    console.log(`Created LocatableService: ${this.name}`);
  }
}

export abstract class LocatableGameService extends LocatableService {
  application: Application;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    const app = serviceLocator.getApplication()
    if (!app) {
      throw new Error('Must initialize application before adding services!');
    }
    this.application = app;
    console.log(`Created LocatableGameService: ${this.name}`);
  }

  isInitialized() { return true; };
  tick(delta: number) {};
}

export class ServiceLocator {
  protected _services: Map<string, LocatableService> = new Map();
  
  addService(service: LocatableService): void {
    this._services.set(service.name, service);
  }

  getService<T extends LocatableService>(
    serviceClass: new (...args: any[]) => T
  ): T {
    const service = this._services.get(serviceClass.name);
    if (!service) {
      throw new Error(`Service ${serviceClass.name} not found`);
    }
    return service as T;
  }
}

export class GameServiceLocator extends ServiceLocator {
  private application?: Application;

  initializeGame(application: Application) {
    this.application = application;
  }

  getApplication() {
    return this.application;
  }

  tick(delta: number) {
    for(let key of this._services.keys()) {
      const service = this._services.get(key) as LocatableGameService;
      if (service?.isInitialized()) {
        service.tick(delta);
      }
    }
  }
}
