import { Vector } from '../vector';
import { Player } from '../player';
import { Vehicle } from './types';
import { Engineerable } from './capabilities';

export class Commander extends Engineerable(Vehicle) {
  constructor(position: Vector, direction: number, player: Player) {
    super({
      position: position,
      direction: direction,
      collisionRadius: 8,
      built: true,
      buildCost: 100,
      player: player,
      fullHealth: 1000,
      health: 1000,
      movementRate: 0.03,
      turnRate: 2.0 / 3.0,
      productionRange: 35.0,
    } as any);
  }
}
