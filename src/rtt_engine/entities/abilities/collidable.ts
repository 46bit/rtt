import { Vector } from '../../vector';
import { Entity, IEntity, IEntityConfig } from '../lib/entity';
import { IOwnableConfig } from './ownable';
import { ComposableConstructor } from '../lib/mixins';

export interface ICollidableConfig extends IEntityConfig {
  collisionRadius: number;
}

export interface ICollidable extends IEntity, IOwnableConfig {
  collisionRadius: number;

  isCollidingWith(otherCollidableEntity: ICollidable, within: number): boolean;
}

export function Collidable<T extends new(o: any) => any>(base: T) {
  class Collidable extends (base as new(o: any) => Entity) {
    // FIXME: Store velocity as a Vector instead?
    public collisionRadius: number;

    constructor(cfg: ICollidableConfig) {
      super(cfg);
      this.collisionRadius = cfg.collisionRadius;
    }

    public isCollidingWith(otherCollidableEntity: Collidable, within = 0) {
      const combinedCollisionRadius = this.collisionRadius + otherCollidableEntity.collisionRadius + within;
      const distanceBetween = Vector.subtract(this.position, otherCollidableEntity.position).magnitude();
      return distanceBetween <= combinedCollisionRadius;
    }
  }

  return Collidable as ComposableConstructor<typeof Collidable, T>;
}
