import { Vector } from '../../vector';
import { IEntityMetadata, IEntityState } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export type Pathfinder = (from: Vector, to: Vector) => Vector[] | null;

export type MovableUnits = KindsOfUnitsWithAbility<IMovableMetadata>;
export interface IMovableMetadata extends IEntityMetadata {
  movementRate: number;
}

export interface IMovableState extends IEntityState {
  kind: MovableUnits;
  velocity: number;
  direction: number;
}

export type IMovableEntityFields = Omit<IMovableState, keyof IEntityState>;
export function newMovable<K extends MovableUnits>(kind: K, cfg?: {velocity?: number, direction?: number}): IMovableEntityFields {
  return {
    velocity: cfg?.velocity ?? 0,
    direction: cfg?.direction ?? 0,
  };
}

export function updatePosition<T extends IMovableState>(value: T): T {
  const speed = value.velocity * UnitMetadata[value.kind].movementRate;
  const velocityVector = Vector.from_magnitude_and_direction(speed, value.direction);
  value.position = Vector.add(value.position, velocityVector);
  return value;
}

export function isGoingSouth(value: IMovableState): boolean {
  return Math.abs(value.direction) < Math.PI / 2;
}

export function isGoingEast(value: IMovableState): boolean {
  return value.direction > 0;
}
