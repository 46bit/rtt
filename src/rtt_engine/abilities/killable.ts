import { ComposableConstructor, IEntity, EntityMetadata, EntitiesWithMetadata, Model } from '../lib';

export interface IKillableMetadata {
  fullHealth: number;
}

export interface IKillableEntity extends IEntity {
  health: number;
  dead: boolean;
  orders?: any[];
}

export function KillableModel<E extends IKillableEntity, T extends new(o: any) => {}>(base: T) {
  class Killable extends (base as new(o: any) => {}) {
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
      return entity.health <  EntityMetadata[entity.kind].fullHealth;
    }

    healthiness(entity: E): number {
      return entity.health / EntityMetadata[entity.kind].fullHealth;
    }
  }

  return Killable as ComposableConstructor<typeof Killable, T>;
}
