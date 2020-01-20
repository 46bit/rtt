import { Units } from './units';
import { DirectFireQuadTree } from './stubs';
import { PowerSource } from './entities/index';

export interface NamedRGB {
  name: string;
  r, g, b: number;
}

export class Player {
  color: NamedRGB;
  units: Units;
  storedEnergy: number;

  constructor(color, units) {
    this.color = color;
    this.units = units;
    this.storedEnergy = 0;
  }

  isDefeated() {
    return this.units.unitCount() + this.units.projectiles.length == 0;
  }

  update(powerSources: Array<PowerSource>, otherPlayers: Array<Player>, directFireQuadtree: DirectFireQuadTree) {
    this.updateEnergy();
    this.units.update();
  }

  updateEnergy() {
    this.storedEnergy += this.units.energyOutput();
  }
}
