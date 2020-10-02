import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { OrderableController } from '../abilities/orderable';
import { Models } from '../lib';
import { IFactory, FactoryMetadata } from '../entities';

export class FactoryController extends OrderableController<IFactory> {
  updateEntities(entities: IFactory[], ctx: abilities.IEntityUpdateContext): IFactory[] {
    return entities.map((e) => this.updateEntity(e, ctx));
  }

  public updateEntity(entity: IFactory, ctx: abilities.IEntityUpdateContext): IFactory {
    if (entity.construction != null) {
      const constructionModel = Models[entity.construction.kind];
      if (constructionModel.isBuilt(entity.construction) || constructionModel.isDead(entity.construction)) {
        entity.construction = undefined;
      }
    }
    Models["factory"].updateProduction(entity);
    this.updateOrders(entity, ctx);
    return entity;
  }

  // FIXME: Deduplicate this code with what's on Engineer
  updateConstructVehicleOrder(entity: IFactory, order: abilities.ConstructVehicleOrder, ctx: abilities.IEntityUpdateContext): boolean {
    if (entity.construction == null) {
      // FIXME: Find a way for the type system to ignore the `powerSource` argument to `powerGenerator`
      // without using any. Checking for `{constructableByMobileUnits: false}` seems to fail.
      entity.construction = Models[order.vehicleKind].newEntity({
        position: entity.position,
        player: entity.player,
        built: false,
      } as any);
    }
    return true;
  }
}

//   kill() {
//     super.kill();
//     this.construction?.kill();
//   }
