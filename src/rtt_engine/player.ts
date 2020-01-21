import { PowerSource } from './entities/index';
import { DirectFireQuadTree } from './stubs';
import { Units } from './units';

export interface INamedRGB {
  name: string;
  r; g; b: number;
}

export class Player {
  public color: INamedRGB;
  public units: Units;
  public storedEnergy: number;

  constructor(color: INamedRGB, units: Units) {
    this.color = color;
    this.units = units;
    this.storedEnergy = 0;
  }

  public isDefeated() {
    return this.units.unitCount() + this.units.projectiles.length === 0;
  }

  public update(powerSources: readonly PowerSource[], otherPlayers: readonly Player[], directFireQuadtree: DirectFireQuadTree) {
    this.updateEnergy();
    this.units.update();
  }

  public updateEnergy() {
    this.storedEnergy += this.units.energyOutput();
  }
}
