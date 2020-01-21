import { Vector } from '../vector';
import { Player } from '../player';
import { Vehicle } from './types';
import { Engineerable } from './capabilities';

export class Bot extends Engineerable(Vehicle) {
  constructor(position: Vector, direction: number, player: Player, built: boolean) {
    super({
      position: position,
      direction: direction,
      collisionRadius: 5,
      built: built,
      buildCost: 100,
      player: player,
      fullHealth: 10,
      health: built ? 10 : 0,
      movementRate: 0.1,
      turnRate: 4.0 / 3.0,
      productionRange: 25.0,
    } as any);
  }
}
