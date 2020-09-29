import { ComposableConstructor, IEntity, EntityMetadata, EntitiesWithMetadata } from '../lib';
import { Model } from '../lib/model';
import { IKillableMetadata, IKillableEntity, KillableModel } from './killable';

export interface IConstructableMetadata extends IKillableMetadata {
  // FIXME: It seems like `buildCost` isn't being used for repairing, and maybe not used anywhere
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export interface IConstructableEntity extends IKillableEntity {
  kind: EntitiesWithMetadata<IConstructableMetadata>;
  built: boolean;
}

export function ConstructableModel<E extends IConstructableEntity, T extends new(o: any) => any>(base: T) {
  class Constructable extends KillableModel(base as new(o: any) => Model<E>) {
    buildCostPerHealth(entity: E): number {
      const buildCost = EntityMetadata[entity.kind].buildCost ?? EntityMetadata[entity.kind].fullHealth * 10;
      return buildCost / EntityMetadata[entity.kind].fullHealth;
    }

    build(entity: E, amount: number): E {
      if (!EntityMetadata[entity.kind].constructableByMobileUnits) {
        return entity;
      }
      this.repair(entity, amount);
      if (!entity.dead && !entity.built) {
        entity.built = (entity.health === EntityMetadata[entity.kind].fullHealth);
      }
      return entity;
    }

    isBuilt(value: E): boolean {
      return value.built;
    }

    isUnderConstruction(value: E): boolean {
      return !value.dead && !value.built;
    }
  }

  return Constructable as ComposableConstructor<typeof Constructable, T>;
}
