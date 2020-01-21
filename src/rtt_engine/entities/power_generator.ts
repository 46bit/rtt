import { EntityConfig, Structure } from './types';
import { PowerSource } from './power_source';
import { Player } from '../player';

export class PowerGenerator extends Structure {
  powerSource: PowerSource;
  energyOutput: number;

  constructor(source: PowerSource, player: Player, built: boolean, energyOutput = 1) {
    super({
      position: source.position,
      collisionRadius: 5,
      player: player,
      built: built,
      buildCost: 100,
      fullHealth: 60,
      health: built ? 60 : 0,
    } as any);
    this.powerSource = source;
    this.energyOutput = energyOutput;
  }
}
