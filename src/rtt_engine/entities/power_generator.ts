import { Player } from '../player';
import { PowerSource } from './power_source';
import { Structure } from './lib';

export class PowerGenerator extends Structure {
  public powerSource: PowerSource;
  public energyOutput: number;

  constructor(source: PowerSource, player: Player, built: boolean, energyOutput = 1) {
    super({
      position: source.position,
      collisionRadius: 5,
      player,
      built,
      buildCost: 100,
      fullHealth: 60,
      health: built ? 60 : 0,
    } as any);
    this.powerSource = source;
    this.energyOutput = energyOutput;
  }
}
