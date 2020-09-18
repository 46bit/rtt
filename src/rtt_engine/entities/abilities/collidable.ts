import { Vector } from '../../vector';
import { IEntity } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export interface ICollidableConfig {
  collisionRadius: number;
}

export type KindsOfUnitsThatAreCollidable = KindsOfUnitsWithAbility<ICollidableConfig>;

export type ICollidable = IEntity<KindsOfUnitsThatAreCollidable>;

export function isColliding(one: ICollidable, two: ICollidable, within = 0): boolean {
  const combinedCollisionRadius = UnitMetadata[one.kind].collisionRadius + UnitMetadata[two.kind].collisionRadius + within;
  const distanceBetween = Vector.subtract(one.position, two.position).magnitude();
  return distanceBetween < combinedCollisionRadius;
}

