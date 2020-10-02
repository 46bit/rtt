import {
  IBot,
  IArtilleryTank,
  IShotgunTank,
  ITitan,
  IEngineer,
  ICommander,
  IFactory,
  IPowerGenerator,
  ITurret,
} from './entities';
import {
  IKillableEntity,
  ICollidableEntity,
  IConstructableEntity,
  IOwnableEntity,
  IEntityUpdateContext,
} from './abilities';
import {
  Models,
  Controllers,
  EntityMetadata,
  IVehicleEntity,
} from './lib';

export class PlayerUnits {
  public unitCap: number | null;
  public commander: ICommander | null;
  public vehicles: IVehicleEntity[];
  public engineers: IEngineer[];
  public factories: IFactory[];
  public powerGenerators: IPowerGenerator[];
  public turrets: ITurret[];
  public constructions: {[id: string]: IKillableEntity & ICollidableEntity & IConstructableEntity & IOwnableEntity};

  public constructor(unitCap: number | null) {
    this.unitCap = unitCap;
    this.commander = null;
    this.vehicles = [];
    this.engineers = [];
    this.factories = [];
    this.powerGenerators = [];
    this.turrets = [];
    this.constructions = {};
  }

  public allKillableCollidableUnits(): (IKillableEntity & ICollidableEntity & IOwnableEntity)[] {
    let units = [];
    // Engineers are also in this.vehicles
    units.push(...this.vehicles);
    units.push(...this.factories);
    units.push(...this.powerGenerators);
    units.push(...this.turrets);
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
      + this.turrets.length
      + Object.keys(this.constructions).length;
  }

  public isAtUnitCap() {
    return this.unitCap != null && this.unitCount() >= this.unitCap;
  }

  public energyOutput() {
    return (this.commander ? EntityMetadata.commander.energyOutput : 0)
      + this.powerGenerators.reduce((sum, powerGenerator) => sum + Models["powerGenerator"].energyOutput(powerGenerator), 0);
  }

  public update(enemies: (IKillableEntity & ICollidableEntity)[], ctx: IEntityUpdateContext) {
    this.removeDeadUnits();
    if (this.commander != null) {
      Controllers.commander.updateEntity(this.commander, ctx);
    }
    Controllers.powerGenerator.updateEntities(this.powerGenerators, ctx);
    for (let vehicle of this.vehicles) {
      let v = vehicle as any;
      Controllers[vehicle.kind].updateEntity(v, ctx);
    }
    Controllers.turret.updateEntities(this.turrets, ctx);
    this.updateFactoriesAndConstructions(ctx);
    this.removeDeadUnits();
  }

  public updateFactoriesAndConstructions(ctx: IEntityUpdateContext) {
    Controllers.factory.updateEntities(this.factories, ctx);
    for (let factory of this.factories) {
      if (factory.construction != null) {
        this.constructions[factory.construction.id] = factory.construction;
      }
    }
    if (this.commander != null && this.commander.construction != null) {
      this.constructions[this.commander.construction.id] = this.commander.construction;
    }
    for (let engineer of this.engineers) {
      if (engineer.construction != null) {
        this.constructions[engineer.construction.id] = engineer.construction;
      }
    }

    for (let unitId in this.constructions) {
      const unit = this.constructions[unitId];
      if (Models[unit.kind].isDead(unit)) {
        delete(this.constructions[unitId]);
        continue;
      }
      if (this.isAtUnitCap() || !Models[unit.kind].isBuilt(unit)) {
        continue;
      }
      delete(this.constructions[unitId]);
      switch (unit.kind) {
        case "factory":
          this.factories.push(unit as IFactory);
          break;
        case "powerGenerator":
          // Power generators have special support for being built by multiple engineers at once
          // and so needs guard logic for the multiple completions that will happen. Eventually this
          // will be present for all structures.
          if (!(this.powerGenerators.includes(unit as IPowerGenerator))) {
            this.powerGenerators.push(unit as IPowerGenerator);
          }
          break;
        case "bot":
          this.vehicles.push(unit as IBot);
          break;
        case "shotgunTank":
          this.vehicles.push(unit as IShotgunTank);
          break;
        case "artilleryTank":
          this.vehicles.push(unit as IArtilleryTank);
          break;
        case "titan":
          this.vehicles.push(unit as ITitan);
          break;
        case "engineer":
          this.vehicles.push(unit as IEngineer);
          this.engineers.push(unit as IEngineer);
          break;
        case "turret":
          this.turrets.push(unit as ITurret);
          break;
        default:
          throw new TypeError('unexpected kind of construction completed: ' + unit);
      }
    }
  }

  public removeDeadUnits() {
    if (this.commander != null && this.commander.dead) {
      this.commander = null;
    }
    this.powerGenerators = this.powerGenerators.filter((powerGenerator) => Models.powerGenerator.isAlive(powerGenerator));
    this.factories = this.factories.filter((factory) => Models.factory.isAlive(factory));
    this.vehicles = this.vehicles.filter((vehicle) => Models[vehicle.kind].isAlive(vehicle));
    this.engineers = this.engineers.filter((engineer) => Models.engineer.isAlive(engineer));
    this.turrets = this.turrets.filter((turret) => Models.turret.isAlive(turret));
  }
}
