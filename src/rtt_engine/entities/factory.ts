import { Vector } from '../vector';
import { Player } from '../player';
import { Structure } from './lib';
import { Engineerable } from './abilities/engineerable';
import { Orderable, ConstructVehicleOrder } from './abilities/orderable';
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
      orderBehaviours: {
        constructVehicle: (o: any) => this.constructVehicle(o),
      },
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

  constructVehicle(constructionOrder: ConstructVehicleOrder): boolean {
    if (this.construction == null) {
      if (this.constructing) {
        this.constructing = false;
        return false;
      } else {
        this.constructing = true;
        this.construction = new constructionOrder.vehicleClass(
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
