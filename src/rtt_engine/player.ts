import { PowerSource, TurretProjectile, IEngineerable, IEntityUpdateContext } from './entities';
import { PlayerUnits } from './player_units';
import lodash from 'lodash';
import * as THREE from 'three';

export class Player {
  public name: string;
  public aiName?: string;
  public color: THREE.Color;
  public units: PlayerUnits;
  public storedEnergy: number;
  public turretProjectiles: TurretProjectile[];

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

  public update(powerSources: readonly PowerSource[], otherPlayers: readonly Player[], context: IEntityUpdateContext) {
    this.updateEnergy();
    const enemies = otherPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
    this.units.update(enemies, context);
    for (let turretProjectile of this.turretProjectiles) {
      turretProjectile.update();
    }
    this.turretProjectiles = this.turretProjectiles.filter((turretProjectile) => turretProjectile.isAlive());
  }

  public updateEnergy() {
    this.storedEnergy += this.units.energyOutput();
    type DrainingUnit = {
      energyProvided: number;
      energyConsumption(): number;
    }
    const drainingUnits = (this.units.factories as DrainingUnit[]).concat(this.units.powerGenerators);
    if (this.units.commander != null) {
      drainingUnits.push(this.units.commander);
    }
    drainingUnits.push(...this.units.engineers);
    const desiredEnergy = lodash.sum(drainingUnits.map((u) => u.energyConsumption()));
    if (desiredEnergy > 0) {
      const proportionOfEnergyProvided = Math.min(this.storedEnergy / desiredEnergy, 1);
      for (let drainingUnit of drainingUnits) {
        drainingUnit.energyProvided = drainingUnit.energyConsumption() * proportionOfEnergyProvided;
      }
      this.storedEnergy -= desiredEnergy * proportionOfEnergyProvided;
    }
  }
}
