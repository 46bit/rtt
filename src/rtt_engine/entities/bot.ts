import { Player } from '../player';
import { Vector } from '../vector';
import { Engineerable } from './capabilities';
import { Vehicle } from './types';

export class Bot extends Engineerable(Vehicle) {
  constructor(position: Vector, direction: number, player: Player, built: boolean) {
    super({
      position,
      direction,
      collisionRadius: 5,
      built,
      buildCost: 100,
      player,
      fullHealth: 10,
      health: built ? 10 : 0,
      movementRate: 0.1,
      turnRate: 4.0 / 3.0,
      productionRange: 25.0,
    } as any);
  }
}
