import { Vector } from '../../vector';
import { IEntityConfig, IEntity } from '../lib/entity';

export type Pathfinder = (from: Vector, to: Vector) => Vector[] | null;

export interface IMovableConfig extends IEntityConfig {
  velocity?: number;
  direction: number;
}

export interface IMovable extends IEntity {
  velocity: number;
  direction: number;
}

export function newMovable<E extends IEntity>(value: E, cfg: IMovableConfig): E & IMovable {
  return {
    ...value,
    velocity: cfg.velocity ?? 0,
    direction: cfg.direction,
  };
}

export function updatePosition<E extends IMovable>(value: E, multiplier = 1): E {
  const movement = Vector.from_magnitude_and_direction(value.velocity * multiplier, value.direction);
  value.position = Vector.add(value.position, movement);
  return value;
}

export function isGoingSouth(value: IMovable): boolean {
  return Math.abs(value.direction) < Math.PI / 2;
}

export function isGoingEast(value: IMovable): boolean {
  return value.direction > 0;
}
