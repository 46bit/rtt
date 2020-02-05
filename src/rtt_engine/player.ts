import { PowerSource } from './entities/index';
import { PlayerUnits } from './player_units';
import lodash from 'lodash';
import * as THREE from 'three';

export class Player {
  public name: string;
  public color: THREE.Color;
  public units: PlayerUnits;
  public storedEnergy: number;

  constructor(name: string, color: THREE.Color, units: PlayerUnits) {
    this.name = name;
    this.color = color;
    this.units = units;
    this.storedEnergy = 0;
  }

  public isDefeated() {
    return this.units.unitCount() === 0;
  }

  public update(powerSources: readonly PowerSource[], otherPlayers: readonly Player[]) {
    this.updateEnergy();
    this.units.update();
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
