import { Vector } from '../vector';
import { Player } from '../player';
import { Structure } from './lib';
import { Engineerable } from './abilities/engineerable';

export class Factory extends Engineerable(Structure) {
  constructor(position: Vector, player: Player, built: boolean) {
    super({
      position,
      collisionRadius: 15,
      player,
      built,
      buildCost: 1200,
      fullHealth: 120,
      health: built ? 120 : 0,
    } as any);
  }

  produceVehicle(unitClass: any, unitExtraArgs = {}): boolean {
    if (this.construction != null) {
      return false;
    }
    this.construction = unitClass.new({
      position: this.position.clone(),
      direction: Math.random() * Math.PI * 2,
      player: this.player,
      built: false,
      ...unitExtraArgs,
    });
    return true;
  }

  kill() {
    super.kill();
    this.construction?.kill();
  }

  update() {
    this.updateProduction();
  }
}
