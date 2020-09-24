import { ComposableConstructor, IEntity, EntityMetadata, EntitiesWithMetadata, Model } from '../lib';
import { IKillableMetadata, IKillableEntity, KillableModel } from '.';



export interface IConstructableMetadata extends IKillableMetadata {
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export interface IConstructableEntity extends IKillableEntity {
  kind: EntitiesWithMetadata<IConstructableMetadata>;
  built: boolean;
}

export function ConstructableModel<E extends IConstructableEntity, T extends new(o: any) => IConstructableMetadata>(base: T) {
  class Constructable extends KillableModel(base as new(o: any) => {}) {
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
  }

  return Constructable as ComposableConstructor<typeof Constructable, T>;
}

export function isBuilt(value: IConstructableEntity): boolean {
  return value.built;
}

export function isUnderConstruction(value: IConstructableEntity): boolean {
  return !value.dead && !value.built;
}
