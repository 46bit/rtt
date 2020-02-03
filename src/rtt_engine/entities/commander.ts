import { Player } from '../player';
import { Vector } from '../vector';
import { Engineerable } from './abilities';
import { Vehicle } from './lib';
import { CommanderPresenter } from '../../rtt_threejs_renderer/presenters/commander_presenter';

export class Commander extends Engineerable(Vehicle) {
  public energyOutput: number;
  constructing: boolean;

  constructor(position: Vector, direction: number, player: Player, scene: THREE.Group) {
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
      scene,
      newPresenter: (commander: this, scene: THREE.Group) => new CommanderPresenter(commander, scene),
    } as any);
    this.energyOutput = 5;
    this.orderExecutionCallbacks['construct'] = (constructionOrder: any): boolean => {
      return this.construct(constructionOrder);
    };
    this.constructing = false;
  }

  kill() {
    super.kill();
    this.construction?.kill();
  }

  update() {
    super.update();
    if (this.construction != null && (this.construction.isBuilt() || this.construction.isDead())) {
      this.construction = null;
    }
    this.updateProduction();
    this.updateOrders();
    if (this.construction == null) {
      this.constructing = false;
    }
  }

  construct(constructionOrder: { position: Vector, structureClass: any }): boolean {
    if (this.construction == null) {
      if (this.constructing) {
        this.constructing = false;
        return false;
      } else {
        this.constructing = true;
        this.construction = new constructionOrder.structureClass(
          constructionOrder.position,
          this.player,
          false,
        );
        return true;
      }
    }
    return true;
  }
}
