import {
  Bot,
  Commander,
  Factory,
  PowerGenerator,
  IKillable,
  ICollidable,
} from './entities';

// FIXME: Do this based upon an `IUnit`?
type Unit = Bot | Commander | PowerGenerator;

// FIXME: Do this based upon an `IVehicle`?
type Vehicle = Bot;

export class PlayerUnits {
  public unitCap: number | null;
  public commander: Commander | null;
  public vehicles: Vehicle[];
  public factories: Factory[];
  public powerGenerators: PowerGenerator[];
  public constructions: {[id: string]: Unit};

  public constructor(unitCap: number | null) {
    this.unitCap = unitCap;
    this.commander = null;
    this.vehicles = [];
    this.factories = [];
    this.powerGenerators = [];
    this.constructions = {};
  }

  public allKillableCollidableUnits(): (IKillable & ICollidable)[] {
    let units = [];
    units.push(...this.vehicles);
    units.push(...this.factories);
    units.push(...this.powerGenerators);
    units.push(...Object.values(this.constructions));
    if (this.commander != null) {
      units.push(this.commander);
    }
    return units;
  }

  public unitCount() {
    return (this.commander ? 1 : 0)
      + this.vehicles.length
      + this.factories.length
      + this.powerGenerators.length
      + Object.keys(this.constructions).length;
  }

  public isAtUnitCap() {
    return this.unitCap != null && this.unitCount() >= this.unitCap;
  }

  public energyOutput() {
    return (this.commander ? this.commander.energyOutput : 0)
      + this.powerGenerators.reduce((sum, powerGenerator) => sum + powerGenerator.energyOutput, 0);
  }

  public update() {
    this.removeDeadUnits();
    this.updateEachOf(this.powerGenerators);
    if (this.commander != null) {
      this.commander.update();
    }
    this.updateEachOf(this.vehicles);
    this.updateFactoriesAndConstructions();
    this.removeDeadUnits();
  }

  public updateEachOf(things: readonly any[]) {
    for (const thing of things) {
      thing.update();
    }
  }

  public updateFactoriesAndConstructions() {
    for (let factory of this.factories) {
      factory.update();
      if (factory.construction != null) {
        this.constructions[factory.construction.id] = factory.construction;
      }
    }

    for (let unitId in this.constructions) {
      const unit = this.constructions[unitId];
      if (this.isAtUnitCap()) {
        break;
      }
      if (!unit.isBuilt()) {
        continue;
      }
      delete(this.constructions[unitId]);
      switch (unit.constructor) {
        case PowerGenerator:
          this.powerGenerators.push(unit as PowerGenerator);
          break;
        case Bot:
          this.vehicles.push(unit as Bot);
          break;
        default:
          throw new TypeError('unexpected kind of construction completed: ' + unit);
      }
    }
  }

  public removeDeadUnits() {
    this.powerGenerators = this.powerGenerators.filter((powerGenerator) => powerGenerator.isAlive());
    if (this.commander != null && this.commander.dead) {
      this.commander = null;
    }
    this.vehicles = this.vehicles.filter((vehicle) => vehicle.isAlive());
  }

  public draw() {
    this.commander?.presenter?.draw();
    // for (let vehicle of this.vehicles) {
    //   vehicle.presenter?.draw();
    // }
    for (let powerGenerator of this.powerGenerators) {
      powerGenerator.presenter?.draw();
    }
  }
}
