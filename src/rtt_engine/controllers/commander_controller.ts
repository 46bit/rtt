import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController, Models } from '../lib';
import { ICommander, CommanderMetadata } from '../entities';

export class CommanderController extends VehicleController<ICommander> {
  updateEntities(entities: ICommander[], ctx: abilities.IEntityUpdateContext): ICommander[] {
    return entities;
  }

  updateEntity(entity: ICommander, ctx: abilities.IEntityUpdateContext): ICommander {
    if (entity.construction != null) {
      const constructionModel = Models[entity.construction.kind];
      if (constructionModel.isBuilt(entity.construction) || constructionModel.isDead(entity.construction)) {
        entity.construction = null;
      }
    }
    Models["commander"].updateProduction(entity);
    this.updateOrders(entity, ctx);
    if (entity.construction == null) {
      entity.constructing = false;
    }
  }

  // FIXME: Deduplicate this code with what's on Engineer
  updateConstructStructureOrder(entity: ICommander, order: abilities.ConstructStructureOrder, ctx: abilities.IEntityUpdateContext): boolean {
    if (Vector.subtract(entity.position, order.position).magnitude() > CommanderMetadata.productionRange) {
      this.updateManoeuvreOrder(entity, {destination: order.position}, ctx);
      return true;
    }
    if (entity.construction == null) {
      if (entity.constructing) {
        entity.constructing = false;
        return false;
      } else if (order.structureClass == PowerGenerator) {
        const powerSource: PowerSource = order.metadata;
        if (powerSource.structure == null) {
          entity.constructing = true;
          entity.construction = new order.structureClass(
            order.position,
            entity.player,
            false,
            powerSource,
          );
        } else if (powerSource.structure.player == entity.player && powerSource.structure.isUnderConstruction()) {
          entity.constructing = true;
          entity.construction = powerSource.structure;
        }
      } else {
        entity.constructing = true;
        entity.construction = new order.structureClass(
          order.position,
          entity.player,
          false,
        );
        return true;
      }
    }
    return true;
  }
}
