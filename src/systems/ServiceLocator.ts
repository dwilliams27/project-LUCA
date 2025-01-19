export abstract class LocatableService {
  name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`Created LocatableService: ${name}`);
  }

  abstract isInitialized(): boolean;
}

export class ServiceLocator {
  private static _services: Map<string, LocatableService> = new Map();

  static addService(service: LocatableService): void {
    this._services.set(service.name, service);
  }

  static getService<T extends LocatableService>(
    serviceClass: new (...args: any[]) => T
  ): T {
    const service = this._services.get(serviceClass.name);
    if (!service) {
      throw new Error(`Service ${serviceClass.name} not found`);
    }
    return service as T;
  }
}
