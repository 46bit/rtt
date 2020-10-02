import lodash from 'lodash';
import * as THREE from 'three';
import {
  IPowerSource,
  IProjectileEntity,
  IEngineerEntity,
  IEntityUpdateContext,
  Models,
  Controllers,
  PlayerUnits,
} from '.';

export class Player {
  public name: string;
  public aiName?: string;
  public color: THREE.Color;
  public units: PlayerUnits;
  public storedEnergy: number;
  public turretProjectiles: IProjectileEntity[];

  constructor(name: string, color: THREE.Color, units: PlayerUnits) {
    this.name = name;
    this.color = color;
    this.units = units;
    this.storedEnergy = 0;
    this.turretProjectiles = [];
  }

  public isDefeated() {
    return this.units.unitCount() === 0;
  }

  public update(powerSources: readonly IPowerSource[], otherPlayers: readonly Player[], ctx: Omit<IEntityUpdateContext, "nearbyEnemies">) {
    this.updateEnergy();
    const enemies = otherPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
    let context: IEntityUpdateContext = {...ctx, nearbyEnemies: enemies};
    this.units.update(enemies, context);
    for (let turretProjectile of this.turretProjectiles) {
      Controllers[turretProjectile.kind].updateEntity(turretProjectile as any, context);
    }
    this.turretProjectiles = this.turretProjectiles.filter((turretProjectile) => Models[turretProjectile.kind].isAlive(turretProjectile));
  }

  public updateEnergy() {
    this.storedEnergy += this.units.energyOutput();
    const drainingUnits: IEngineerEntity[] = (this.units.factories as any).concat(this.units.powerGenerators);
    if (this.units.commander != null) {
      drainingUnits.push(this.units.commander);
    }
    drainingUnits.push(...this.units.engineers);
    const desiredEnergy = lodash.sum(drainingUnits.map((u) => Models[u.kind].energyConsumption(u)));
    if (desiredEnergy > 0) {
      const proportionOfEnergyProvided = Math.min(this.storedEnergy / desiredEnergy, 1);
      for (let drainingUnit of drainingUnits) {
        drainingUnit.energyProvided = Models[drainingUnit.kind].energyConsumption(drainingUnit) * proportionOfEnergyProvided;
      }
      this.storedEnergy -= desiredEnergy * proportionOfEnergyProvided;
    }
  }
}
