import { Vector } from '../vector';
import { IEntity, EntityMetadata, EntitiesWithMetadata } from '../lib';

export interface ICollidableMetadata {
  collisionRadius: number;
}

export interface ICollidableEntity extends IEntity {
  kind: EntitiesWithMetadata<ICollidableMetadata>;
}

export function isColliding(one: ICollidableEntity, two: ICollidableEntity, within = 0): boolean {
  const oneRadius = (one as any).circumcircleRadius ?? EntityMetadata[one.kind].collisionRadius;
  const twoRadius = (two as any).circumcircleRadius ?? EntityMetadata[two.kind].collisionRadius;
  const combinedCollisionRadius = oneRadius + twoRadius;
  const distanceBetween = Vector.subtract(one.position, two.position).magnitude();
  return distanceBetween < combinedCollisionRadius;
}
