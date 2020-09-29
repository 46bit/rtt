import { ComposableConstructor, IEntity, EntityMetadata, EntitiesWithMetadata } from '../lib';
import { Model } from '../lib/model';

export interface IKillableMetadata {
  fullHealth: number;
}

export interface IKillableEntity extends IEntity {
  kind: EntitiesWithMetadata<IKillableMetadata>;
  health: number;
  dead: boolean;
  orders?: any[];
}

export interface IKillableModel {
  kill(entity: any): any;
}

export function KillableModel<E extends IKillableEntity, T extends new(o: any) => any>(base: T) {
  class Killable extends (base as new(o: any) => Model<E>) {
    kill(entity: E): E {
      entity.dead = true;
      entity.health = 0;
      if (entity.orders) {
        entity.orders = [];
      }
      return entity;
    }

    repair(entity: E, amount: number): E {
      entity.health = Math.min(entity.health + amount, EntityMetadata[entity.kind].fullHealth);
      return entity;
    }

    damage(entity: E, amount: number): E {
      entity.health = Math.max(entity.health - amount, 0);
      if (entity.health <= 0) {
        entity = this.kill(entity);
      }
      return entity;
    }

    isDead(entity: E): boolean {
      return entity.dead;
    }

    isAlive(entity: E): boolean {
      return !entity.dead;
    }

    isDamaged(entity: E): boolean {
      return entity.health < EntityMetadata[entity.kind].fullHealth;
    }

    healthiness(entity: E): number {
      return entity.health / EntityMetadata[entity.kind].fullHealth;
    }
  }

  return Killable as ComposableConstructor<typeof Killable, T>;
}
