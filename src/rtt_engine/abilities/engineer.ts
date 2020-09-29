import { Vector } from '..';
import { IConstructableEntity } from '.';
import { ComposableConstructor, IEntity, EntityMetadata, EntitiesWithMetadata, Entities, EntitiesWithState, Models } from '../lib';

export interface IEngineerMetadata {
  productionRange: number;
}

export interface IEngineerEntity extends IEntity {
  kind: EntitiesWithMetadata<IEngineerMetadata>;
  energyProvided: number;
  construction?: Entities[EntitiesWithState<IConstructableEntity>];
}

export function EngineerModel<E extends IEngineerEntity, T extends new(o: any) => {}>(base: T) {
  class Engineer extends (base as new(o: any) => {}) {
    isProducing(entity: E): boolean {
      return !!entity.construction;
    }

    productionProgress(entity: E): number {
      // FIXME: The typechecker couldn't understand that `healthiness` only has to take the
      // type matching the model. Try to fix that. Same problem recurs further down.
      // This problem may go away when I stop passing around entities themselves?
      return Models[entity.construction!.kind].healthiness(entity.construction! as any);
    }

    energyConsumption(entity: E): number {
      return this.isProducing(entity) ? 20 : 0;
    }

    isWithinProductionRange(entity: E, target: Vector): boolean {
      return Vector.subtract(entity.position, target).magnitude() <= EntityMetadata[entity.kind].productionRange;
    }

    updateProduction(entity: E): E {
      if (!entity.construction) {
        return entity;
      }
      const constructionModel = Models[entity.construction!.kind];

      if (constructionModel.isDead(entity.construction)) {
        entity.construction = undefined;
        return entity;
      }

      if (constructionModel.isBuilt(entity.construction)) {
        return entity;
      }

      if (this.isWithinProductionRange(entity, entity.construction.position)) {
        const healthIncrease = entity.energyProvided / constructionModel.buildCostPerHealth(entity.construction);
        constructionModel.build(entity.construction as any, healthIncrease);
      }

      return entity;
    }
  }

  return Engineer as ComposableConstructor<typeof Engineer, T>;
}
