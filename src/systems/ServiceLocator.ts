import { Application } from "pixi.js";

export abstract class LocatableService {
  name: string;
  serviceLocator: ServiceLocator;

  constructor(name: string, serviceLocator: ServiceLocator) {
    this.name = name;
    this.serviceLocator = serviceLocator;
    console.log(`Created LocatableService: ${name}`);
  }
}

export abstract class LocatableGameService extends LocatableService {
  application: Application;

  constructor(name: string, serviceLocator: GameServiceLocator) {
    super(name, serviceLocator);
    const app = serviceLocator.getApplication()
    if (!app) {
      throw new Error('Must initialize application before adding services!');
    }
    this.application = app;
    console.log(`Created LocatableGameService: ${name}`);
  }

  abstract isInitialized(): boolean;
  abstract tick(delta: number): void;
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
