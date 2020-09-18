import {
  Bot,
  ArtilleryTank,
  ShotgunTank,
  Titan,
  Engineer,
  Commander,
  Factory,
  PowerGenerator,
  Turret,
  IKillable,
  ICollidable,
  IConstructable,
  IOwnable,
  IEntity,
  IUnit,
  IEntityUpdateContext,
} from './entities';

// FIXME: Do this based upon an `IUnit`?
type Unit = Bot | ArtilleryTank | ShotgunTank | Titan | Engineer | Commander | PowerGenerator | Factory | Turret;

// FIXME: Do this based upon an `IVehicle`?
type Vehicle = Bot | ArtilleryTank | ShotgunTank | Titan | Engineer;

export class PlayerUnits {
  public unitCap: number | null;
  public unitsByKind: Map<string, IUnit[]>;
  public constructionsById: Map<string, IUnit>;

  public constructor(unitCap: number | null) {
    this.unitCap = unitCap;
    this.unitsByKind = new Map();
    this.constructionsById = new Map();
  }

  public unitCount() {
    return this.unitsByKind.size;
  }

  public isAtUnitCap() {
    return this.unitCap != null && this.unitCount() >= this.unitCap;
  }

  public energyOutput() {
    let output = 0;
    output += this.unitsByKind.get("commander").reduce((sum, com) => sum + com.energyOutput, 0);
    output += this.unitsByKind.get("powerGenerator").reduce((sum, powerGen) => sum + powerGen.energyOutput, 0);
    return output;
  }

  public update(enemies: (IKillable & ICollidable)[], context: IEntityUpdateContext) {
    this.removeDeadUnits();
    if (this.commander != null) {
      this.commander.update({context});
    }
    for (let powerGenerator of this.powerGenerators) {
      powerGenerator.update({context});
    }
    for (let vehicle of this.vehicles) {
      switch (vehicle.constructor) {
        case Bot:
          (vehicle as Bot).update({context});
          break;
        case ShotgunTank:
          (vehicle as ShotgunTank).update({enemies, context});
          break;
        case ArtilleryTank:
          (vehicle as ArtilleryTank).update({enemies, context});
          break;
        case Titan:
          (vehicle as Titan).update({enemies, context});
          break;
        case Engineer:
          (vehicle as Engineer).update({context});
          break;
      }
    }
    for (const turret of this.turrets) {
      turret.update({enemies, context});
    }
    this.updateFactoriesAndConstructions(context);
    this.removeDeadUnits();
  }

  public updateFactoriesAndConstructions(context: IEntityUpdateContext) {
    for (let factory of this.factories) {
      factory.update({context});
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
      if (unit.isDead()) {
        delete(this.constructions[unitId]);
        continue;
      }
      if (this.isAtUnitCap() || !unit.isBuilt()) {
        continue;
      }
      delete(this.constructions[unitId]);
      switch (unit.constructor) {
        case Factory:
          this.factories.push(unit as Factory);
          break;
        case PowerGenerator:
          // Power generators have special support for being built by multiple engineers at once
          // and so needs guard logic for the multiple completions that will happen. Eventually this
          // will be present for all structures.
          if (!(this.powerGenerators.includes(unit as PowerGenerator))) {
            this.powerGenerators.push(unit as PowerGenerator);
          }
          break;
        case Bot:
          this.vehicles.push(unit as Bot);
          break;
        case ShotgunTank:
          this.vehicles.push(unit as ShotgunTank);
          break;
        case ArtilleryTank:
          this.vehicles.push(unit as ArtilleryTank);
          break;
        case Titan:
          this.vehicles.push(unit as Titan);
          break;
        case Engineer:
          this.vehicles.push(unit as Engineer);
          this.engineers.push(unit as Engineer);
          break;
        case Turret:
          this.turrets.push(unit as Turret);
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
    this.powerGenerators = this.powerGenerators.filter((powerGenerator) => powerGenerator.isAlive());
    this.factories = this.factories.filter((factory) => factory.isAlive());
    this.vehicles = this.vehicles.filter((vehicle) => vehicle.isAlive());
    this.engineers = this.engineers.filter((engineer) => engineer.isAlive());
    this.turrets = this.turrets.filter((turret) => turret.isAlive());
  }
}
