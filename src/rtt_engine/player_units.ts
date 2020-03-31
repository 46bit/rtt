import {
  Bot,
  Turret,
  IKillable,
  ICollidable,
  IEntity,
} from './entities';

// FIXME: Do this based upon an `IUnit`?
type Unit = Bot | Turret;

// FIXME: Do this based upon an `IVehicle`?
type Vehicle = Bot;

export class PlayerUnits {
  public unitCap: number | null;
  public vehicles: Vehicle[];
  public turrets: Turret[];
  public constructions: {[id: string]: Unit};

  public constructor(unitCap: number | null) {
    this.unitCap = unitCap;
    this.vehicles = [];
    this.turrets = [];
    this.constructions = {};
  }

  public allKillableCollidableUnits(): (IKillable & ICollidable)[] {
    let units = [];
    units.push(...this.vehicles);
    units.push(...this.turrets);
    units.push(...Object.values(this.constructions));
    return units;
  }

  public unitCount() {
    return this.vehicles.length
      + this.turrets.length
      + Object.keys(this.constructions).length;
  }

  public isAtUnitCap() {
    return this.unitCap != null && this.unitCount() >= this.unitCap;
  }

  public update(enemies: IEntity[]) {
    this.removeDeadUnits();
    for (let vehicle of this.vehicles) {
      switch (vehicle.constructor) {
        case Bot:
          (vehicle as Bot).update();
          break;
      }
    }
    for (const turret of this.turrets) {
      turret.update(enemies);
    }
    this.updateFactoriesAndConstructions();
    this.removeDeadUnits();
  }

  public updateFactoriesAndConstructions() {
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
        case Bot:
          this.vehicles.push(unit as Bot);
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
    this.vehicles = this.vehicles.filter((vehicle) => vehicle.isAlive());
    this.turrets = this.turrets.filter((turret) => turret.isAlive());
  }

  public draw() { }
}
