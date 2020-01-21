import { Player } from '../player';
import { Vector } from '../vector';
import { Engineerable } from './capabilities';
import { Vehicle } from './types';

export class Commander extends Engineerable(Vehicle) {
  constructor(position: Vector, direction: number, player: Player) {
    super({
      position,
      direction,
      collisionRadius: 8,
      built: true,
      buildCost: 100,
      player,
      fullHealth: 1000,
      health: 1000,
      movementRate: 0.03,
      turnRate: 2.0 / 3.0,
      productionRange: 35.0,
    } as any);
  }
}
