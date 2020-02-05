import { Player } from '../player';
import { PowerSource } from './power_source';
import { Structure } from './lib';
import { Vector } from '../vector';

export class PowerGenerator extends Structure {
  public powerSource: PowerSource;
  public energyOutput: number;

  constructor(position: Vector, player: Player, built: boolean, powerSource: PowerSource, energyOutput = 1) {
    if (powerSource.position != position) {
      throw new Error("trying to build a power generator at a different location to the power source.")
    }
    super({
      position: position,
      collisionRadius: 8,
      player,
      built,
      buildCost: 100,
      fullHealth: 60,
      health: built ? 60 : 0,
    } as any);
    this.powerSource = powerSource;
    this.powerSource.structure = this;
    this.energyOutput = energyOutput;
  }

  kill() {
    super.kill();
    this.powerSource.structure = null;
  }
}
