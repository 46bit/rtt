import { Vector } from '../vector';
import { Player } from '../player';
import { Structure } from './lib';
import { Engineerable } from './abilities/engineerable';
import { Orderable } from './abilities/orderable';
import { IManoeuvrable } from './abilities/manoeuverable';
import { IConstructable } from './abilities/constructable';

export class Factory extends Orderable(Engineerable(Structure)) {
  constructing: boolean;

  constructor(position: Vector, player: Player, built: boolean) {
    super({
      position,
      collisionRadius: 15,
      player,
      built,
      buildCost: 1200,
      fullHealth: 120,
      health: built ? 120 : 0,
      orderExecutionCallbacks: {
        'construct': (constructionOrder: any): boolean => {
          return this.construct(constructionOrder);
        }
      }
    } as any);
    this.constructing = false;
  }

  kill() {
    super.kill();
    this.construction?.kill();
  }

  update() {
    if (this.construction != null && this.construction.isBuilt()) {
      this.construction = null;
    }
    this.updateProduction();
    this.updateOrders();
    if (this.construction == null) {
      this.constructing = false;
    }
  }

  construct(constructionOrder: { unitClass: any }): boolean {
    if (this.construction == null) {
      if (this.constructing) {
        this.constructing = false;
        return false;
      } else {
        this.constructing = true;
        this.construction = new constructionOrder.unitClass(
          this.position.clone(),
          Math.random() * Math.PI * 2,
          this.player,
          false,
        );
        return true;
      }
    }
    return true;
  }
}
