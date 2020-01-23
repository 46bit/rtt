import { Player } from '../player';
import { Vector } from '../vector';
import { Engineerable } from './abilities';
import { Vehicle } from './lib';

export class Commander extends Engineerable(Vehicle) {
  public energyOutput: number;

  constructor(position: Vector, direction: number, player: Player, energyOutput = 1) {
    super({
      position,
      direction,
      collisionRadius: 8,
      built: true,
      buildCost: 10000,
      player,
      fullHealth: 1000,
      health: 1000,
      movementRate: 0.03,
      turnRate: 2.0 / 3.0,
      productionRange: 35.0,
    } as any);
    this.energyOutput = energyOutput;
  }
}
