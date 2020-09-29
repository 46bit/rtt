import { Player, Vector } from '..';
import { EntityMetadata, Models } from '../lib';
import * as abilities from '../abilities';
import { OrderableController } from '../abilities/orderable';
import { IPowerGenerator, PowerGeneratorMetadata } from '../entities';

export class PowerGeneratorController extends OrderableController<IPowerGenerator> {
  updateEntities(entities: IPowerGenerator[], ctx: abilities.IEntityUpdateContext): IPowerGenerator[] {
    return entities.map((e) => this.updateOrders(e, ctx));
  }

  updateUpgradeOrder(entity: IPowerGenerator, ctx: abilities.IEntityUpdateContext): boolean {
    if (entity.upgrading == true) {
      if (entity.health >= PowerGeneratorMetadata.fullHealth) {
        entity.upgrading = false;
        entity.upgradeLevel++;
        return false;
      } else {
        Models["powerGenerator"].repair(entity, entity.energyProvided / Models["powerGenerator"].buildCostPerHealth(entity));
      }
    } else {
      if (entity.upgradeLevel >= PowerGeneratorMetadata.maxUpgradeLevel) {
        return false;
      }
      entity.upgrading = true;
    }
    return true;
  }
}
