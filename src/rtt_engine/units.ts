import {
  Commander,
  Construction,
  Factory,
  PowerGenerator,
  Projectile,
  Turret,
  Vehicle,
} from './entities/index';

export class Units {
  public unitCap: number | null;
  public constructions: readonly Construction[];
  public projectiles: readonly Projectile[];
  public commander: Commander | null;
  public vehicles: readonly Vehicle[];
  public powerGenerators: readonly PowerGenerator[];
  public factories: readonly Factory[];
  public turrets: readonly Turret[];

  public unitCount() {
    return this.constructions.length
      + (this.commander ? 1 : 0)
      + this.vehicles.length
      + this.powerGenerators.length
      + this.factories.length
      + this.turrets.length;
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
    this.updateEach(this.powerGenerators);
    this.updateEach(this.factories);
    this.updateEach(this.vehicles);
    this.updateEach(this.turrets);
    this.updateEach(this.projectiles);
    this.updateConstructions();
    this.removeDeadUnits();
  }

  public updateEach(things: readonly any[]) {
    for (const thing of things) {
      thing.update();
    }
  }

  public updateConstructions() {
    this.constructions = this.constructions.filter((construction) => {
      if (this.isAtUnitCap() || !construction.isComplete()) {
        return true;
      }

      switch (construction.kind) {
        case 'POWER_GENERATOR':
          this.powerGenerators.push(construction.unit);
        case 'FACTORY':
          this.factories.push(construction.unit);
        case 'TURRET':
          this.turrets.push(construction.unit);
        case 'VEHICLE':
          this.vehicles.push(construction.unit);
        default:
          throw new TypeError('unexpected kind of construction completed: ' + construction.kind);
      }
      return false;
    });
  }

  public removeDeadUnits() {
    this.powerGenerators = this.powerGenerators.filter((powerGenerator) => powerGenerator.isAlive());
    this.factories = this.factories.filter((factory) => factory.isAlive());
    this.vehicles = this.vehicles.filter((vehicle) => vehicle.isAlive());
    this.turrets = this.turrets.filter((turret) => turret.isAlive());
    this.projectiles = this.projectiles.filter((projectile) => projectile.isAlive());
  }
}
