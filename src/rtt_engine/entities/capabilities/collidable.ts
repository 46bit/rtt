import { Vector } from '../../vector';
import { Entity } from '../types/entity';

export interface ICollidableConfig {
  collisionRadius: number;
}

export function Collidable<T extends new(o: any) => any>(Base: T) {
  class Collidable extends (Base as new(o: any) => Entity) {
    // FIXME: Store velocity as a Vector instead?
    collisionRadius: number;

    constructor(cfg: ICollidableConfig) {
      super(cfg);
      this.collisionRadius = cfg.collisionRadius;
    }

    isCollidingWith(otherCollidableEntity: Collidable, within = 0) {
      const combinedCollisionRadius = this.collisionRadius + otherCollidableEntity.collisionRadius + within;
      const distanceBetween = Vector.subtract(this.position, otherCollidableEntity.position).magnitude();
      return distanceBetween <= combinedCollisionRadius;
    }
  }

  return Collidable as ComposableConstructor<typeof Collidable, T>
}
