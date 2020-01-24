import { PowerSource } from './entities/index';
import { PlayerUnits } from './player_units';

export interface IColor {
  r: number;
  g: number;
  b: number;
}

export class Player {
  public name: string;
  public color: IColor;
  public units: PlayerUnits;
  public storedEnergy: number;

  constructor(name: string, color: IColor, units: PlayerUnits) {
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
  }
}
