import { Vector } from '../../vector';
import { IEntityMetadata, IEntityState } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export type CollidableUnits = KindsOfUnitsWithAbility<ICollidableMetadata>;
export interface ICollidableMetadata extends IEntityMetadata {
  collisionRadius: number;
}

export interface ICollidableState extends IEntityState {
  kind: CollidableUnits;
}

export function isColliding(one: ICollidableState, two: ICollidableState, within = 0): boolean {
  const combinedCollisionRadius = UnitMetadata[one.kind].collisionRadius + UnitMetadata[two.kind].collisionRadius + within;
  const distanceBetween = Vector.subtract(one.position, two.position).magnitude();
  return distanceBetween < combinedCollisionRadius;
}
