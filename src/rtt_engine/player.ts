import { PowerSource, TurretProjectile } from './entities/index';
import { PlayerUnits } from './player_units';
import lodash from 'lodash';
import * as THREE from 'three';

export class Player {
  public name: string;
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

  public update(powerSources: readonly PowerSource[], otherPlayers: readonly Player[]) {
    this.updateEnergy();
    const enemies = otherPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
    this.units.update(enemies);
    for (let turretProjectile of this.turretProjectiles) {
      turretProjectile.update();
    }
    this.turretProjectiles = this.turretProjectiles.filter((turretProjectile) => turretProjectile.isAlive());
  }

  public updateEnergy() {
    this.storedEnergy += this.units.energyOutput();
    let desiredEnergy = lodash.sum(this.units.factories.map((f) => f.energyConsumption()));
    if (this.units.commander != null) {
      desiredEnergy += this.units.commander.energyConsumption();
    }
    const proportionOfEnergyProvided = Math.min(this.storedEnergy / desiredEnergy, 1);
    for (let factory of this.units.factories) {
      factory.energyProvided = factory.energyConsumption() * proportionOfEnergyProvided;
    }
    if (this.units.commander != null) {
      this.units.commander.energyProvided = this.units.commander.energyConsumption() * proportionOfEnergyProvided;
    }
    this.storedEnergy -= desiredEnergy * proportionOfEnergyProvided;
  }

  public draw() {
    this.units.draw();
  }
}