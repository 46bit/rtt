import { Vector } from '../../vector';
import { IEntityConfig, IEntity } from '../lib/entity';

export interface ICollidableConfig extends IEntityConfig {
  collisionRadius: number;
}

export interface ICollidable extends IEntity {
  collisionRadius: number;
}

export function newCollidable<E extends IEntity>(value: E, cfg: ICollidableConfig): E & ICollidable {
  return { ...value, collisionRadius: cfg.collisionRadius };
}

export function isColliding(one: ICollidable, two: ICollidable, within = 0): boolean {
  const combinedCollisionRadius = one.collisionRadius + two.collisionRadius + within;
  const distanceBetween = Vector.subtract(one.position, two.position).magnitude();
  return distanceBetween < combinedCollisionRadius;
}
