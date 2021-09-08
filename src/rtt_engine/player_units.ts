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
  IEngineerable,
  IEntity,
  IEntityUpdateContext,
} from './entities';

// FIXME: Do this based upon an `IUnit`?
type Unit = Bot | ArtilleryTank | ShotgunTank | Titan | Engineer | Commander | PowerGenerator | Factory | Turret;

// FIXME: Do this based upon an `IVehicle`?
type Vehicle = Bot | ArtilleryTank | ShotgunTank | Titan | Engineer;

interface IConstruction {
  construction: IConstructable & IKillable & ICollidable & IOwnable;
  engineer: IEngineerable & IKillable | null;
}

export class PlayerUnits {
  public unitCap: number | null;
  public commander: Commander | null;
  public vehicles: Vehicle[];
  public engineers: Engineer[];
  public factories: Factory[];
  public powerGenerators: PowerGenerator[];
  public turrets: Turret[];
  public constructions: {[id: string]: IConstruction};

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

  public allKillableCollidableUnits(): (IKillable & ICollidable & IOwnable)[] {
    let units = [];
    // Engineers are also in this.vehicles
    units.push(...this.vehicles);
    units.push(...this.factories);
    units.push(...this.powerGenerators);
    units.push(...this.turrets);
    units.push(...Object.values(this.constructions).map(c => c.construction));
    if (this.commander != null) {
      units.push(this.commander);
    }
    return units;
  }

  public unitCount() {
    return (this.commander ? 1 : 0)
      + this.vehicles.length
      + this.engineers.length
      + this.factories.length
      + this.powerGenerators.length
      + this.turrets.length;
    //+ Object.keys(this.constructions).length;
  }

  public isAtUnitCap() {
    return this.unitCap != null && this.unitCount() >= this.unitCap;
  }

  public energyOutput() {
    return (this.commander ? this.commander.energyOutput : 0)
      + this.powerGenerators.reduce((sum, powerGenerator) => sum + powerGenerator.energyOutput, 0);
  }

  public update(enemies: (IKillable & ICollidable)[], context: IEntityUpdateContext) {
    window.profiler.time("remove_dead_units", () => {
      this.removeDeadUnits();
    });
    if (this.commander != null) {
      const commander = this.commander;
      window.profiler.time("commander_update", () => {
        commander.update({context});
      });
    }
    window.profiler.time("power_generator_update", () => {
      for (let powerGenerator of this.powerGenerators) {
        powerGenerator.update({context});
      }
    });

    window.profiler.time("vehicle_update", () => {
      for (let vehicle of this.vehicles) {
        switch (vehicle.constructor) {
          case Bot:
            window.profiler.time("bot_update", () => {
              (vehicle as Bot).update({context});
            });
            break;
          case ShotgunTank:
            window.profiler.time("shotgun_tank_update", () => {
              (vehicle as ShotgunTank).update({enemies, context});
            });
            break;
          case ArtilleryTank:
            window.profiler.time("artillery_tank_update", () => {
              (vehicle as ArtilleryTank).update({enemies, context});
            });
            break;
          case Titan:
            window.profiler.time("titan_update", () => {
              (vehicle as Titan).update({enemies, context});
            });
            break;
          case Engineer:
            window.profiler.time("engineer_update", () => {
              (vehicle as Engineer).update({context});
            });
            break;
        }
      }
    });

    window.profiler.time("turret_update", () => {
      for (const turret of this.turrets) {
        turret.update({enemies, context});
      }
    });
    window.profiler.time("construction_update", () => {
      this.updateFactoriesAndConstructions(context);
    });
    window.profiler.time("remove_dead_units", () => {
      this.removeDeadUnits();
    });
  }

  public updateFactoriesAndConstructions(context: IEntityUpdateContext) {
    for (let factory of this.factories) {
      factory.update({context});
      if (factory.construction != null) {
        this.constructions[factory.construction.id] = {
          construction: factory.construction,
          engineer: factory,
        };
      }
    }
    if (this.commander != null && this.commander.construction != null) {
      this.constructions[this.commander.construction.id] = {
        construction: this.commander.construction,
        engineer: this.commander,
      };
    }
    for (let engineer of this.engineers) {
      if (engineer.construction != null) {
        this.constructions[engineer.construction.id] = {
          construction: engineer.construction,
          engineer,
        };
      }
    }

    for (let unitId in this.constructions) {
      const construction = this.constructions[unitId];
      if (construction.construction.isDead()) {
        delete(this.constructions[unitId]);
        // FIXME: This does mean that if you stop creating something before it dies, you
        // escape the cooldown. When I refactor the engineering code to make that possible,
        // I'll have to improve this too.
        if (construction.engineer && construction.engineer.construction == construction as any) {
          construction.engineer.cooldownBeforeNextConstruction = 30;
        }
        continue;
      }
      if (construction.engineer?.isDead()) {
        construction.engineer = null;
      }
      if (this.isAtUnitCap() || !construction.construction.isBuilt()) {
        if (!construction.engineer) {
          // If nothing is building something, gradually damage it.
          construction.construction.damage(1);
        }
        continue;
      }

      delete(this.constructions[unitId]);
      if (construction.engineer) {
        // When something finishes construction, make the thing that built it
        // wait before building something else. This protects against some cheesy
        // strategies for confusing AIs.
        construction.engineer.cooldownBeforeNextConstruction = 30;
      }
      switch (construction.construction.constructor) {
        case Factory:
          this.factories.push(construction.construction as Factory);
          break;
        case PowerGenerator:
          // Power generators have special support for being built by multiple engineers at once
          // and so needs guard logic for the multiple completions that will happen. Eventually this
          // will be present for all structures.
          if (!(this.powerGenerators.includes(construction.construction as PowerGenerator))) {
            this.powerGenerators.push(construction.construction as PowerGenerator);
          }
          break;
        case Bot:
          this.vehicles.push(construction.construction as Bot);
          break;
        case ShotgunTank:
          this.vehicles.push(construction.construction as ShotgunTank);
          break;
        case ArtilleryTank:
          this.vehicles.push(construction.construction as ArtilleryTank);
          break;
        case Titan:
          this.vehicles.push(construction.construction as Titan);
          break;
        case Engineer:
          this.vehicles.push(construction.construction as Engineer);
          this.engineers.push(construction.construction as Engineer);
          break;
        case Turret:
          this.turrets.push(construction.construction as Turret);
          break;
        default:
          throw new TypeError('unexpected kind of construction completed: ' + construction.construction);
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
