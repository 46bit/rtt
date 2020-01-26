import {
  Bot,
  Commander,
  PowerGenerator,
} from './entities';

// FIXME: Do this based upon an `IUnit`?
type Unit = Bot | Commander | PowerGenerator;

// FIXME: Do this based upon an `IVehicle`?
type Vehicle = Bot;

export class PlayerUnits {
  public unitCap: number | null;
  public commander: Commander | null;
  public vehicles: Vehicle[];
  public powerGenerators: PowerGenerator[];
  public constructions: readonly Unit[];

  public constructor(unitCap: number | null) {
    this.unitCap = unitCap;
    this.commander = null;
    this.vehicles = [];
    this.powerGenerators = [];
    this.constructions = [];
  }

  public unitCount() {
    return (this.commander ? 1 : 0)
      + this.vehicles.length
      + this.powerGenerators.length
      + this.constructions.length;
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
    this.updateConstructions();
    this.removeDeadUnits();
  }

  public updateEachOf(things: readonly any[]) {
    for (const thing of things) {
      thing.update();
    }
  }

  public updateConstructions() {
    this.constructions = this.constructions.filter((construction) => {
      if (this.isAtUnitCap() || !construction.isBuilt()) {
        return true;
      }

      switch (construction.kind) {
        case 'POWER_GENERATOR':
          this.powerGenerators.push(construction);
        case 'VEHICLE':
          this.vehicles.push(construction);
        default:
          throw new TypeError('unexpected kind of construction completed: ' + construction.kind);
      }
      return false;
    });
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
    for (let vehicle of this.vehicles) {
      vehicle.presenter?.draw();
    }
    for (let powerGenerator of this.powerGenerators) {
      powerGenerator.presenter?.draw();
    }
    for (let construction of this.constructions) {
      construction.presenter?.draw();
    }
  }
}
