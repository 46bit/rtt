import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController, Models } from '../lib';
import { ICommander, CommanderMetadata, IPowerSource } from '../entities';

export class CommanderController extends VehicleController<ICommander> {
  updateEntities(entities: ICommander[], ctx: abilities.IEntityUpdateContext): ICommander[] {
    return entities;
  }

  updateEntity(entity: ICommander, ctx: abilities.IEntityUpdateContext): ICommander {
    if (entity.construction != null) {
      const constructionModel = Models[entity.construction.kind];
      if (constructionModel.isBuilt(entity.construction) || constructionModel.isDead(entity.construction)) {
        entity.construction = undefined;
      }
    }
    Models["commander"].updateProduction(entity);
    this.updateOrders(entity, ctx);
  }

  // FIXME: Deduplicate this code with what's on Engineer
  updateConstructStructureOrder(entity: ICommander, order: abilities.ConstructStructureOrder, ctx: abilities.IEntityUpdateContext): boolean {
    if (Vector.subtract(entity.position, order.position).magnitude() > CommanderMetadata.productionRange) {
      this.updateManoeuvreOrder(entity, {destination: order.position}, ctx);
      return true;
    }
    if (entity.construction == null) {
      if (order.structureKind == "powerGenerator") {
        const powerSource: IPowerSource = order.metadata;
        if (powerSource.structure == null) {
          entity.construction = Models["powerGenerator"].newEntity({
            position: powerSource.position,
            player: entity.player,
            built: false,
            powerSource,
          });
        } else if (powerSource.structure.player == entity.player && Models[powerSource.structure.kind].isUnderConstruction(powerSource.structure)) {
          entity.construction = powerSource.structure;
        }
      } else {
        entity.construction = Models[order.structureKind].newEntity({
          position: order.position,
          player: entity.player,
          built: false,
        });
        return true;
      }
    }
    return true;
  }
}
