import { Vector } from '../vector';
import { IEntity, EntityMetadata, EntitiesWithMetadata } from '../lib';

export interface ICollidableMetadata {
  collisionRadius: number;
}

export interface ICollidableEntity extends IEntity {
  kind: EntitiesWithMetadata<ICollidableMetadata>;
}

export function isColliding(one: ICollidableEntity, two: ICollidableEntity, within = 0): boolean {
  const combinedCollisionRadius = EntityMetadata[one.kind].collisionRadius + EntityMetadata[two.kind].collisionRadius + within;
  const distanceBetween = Vector.subtract(one.position, two.position).magnitude();
  return distanceBetween < combinedCollisionRadius;
}
