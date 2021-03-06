import { Vector } from '../../vector';
import { Entity, IEntity } from '../lib/entity';
import { ComposableConstructor } from '../lib/mixins';

export type Pathfinder = (from: Vector, to: Vector) => Vector[] | null;

export interface IMovableConfig {
  velocity?: number;
  direction: number;
}

export interface IMovable extends IEntity {
  velocity: number;
  direction: number;
}

export function Movable<T extends new(o: any) => any>(base: T) {
  class Movable extends (base as new(o: any) => Entity) implements IMovable {
    // FIXME: Store velocity as a Vector instead?
    public velocity: number;
    public direction: number;

    constructor(cfg: IMovableConfig) {
      super(cfg);
      this.velocity = cfg.velocity ?? 0;
      this.direction = cfg.direction == null ? 0 : cfg.direction;
    }

    public updatePosition(multiplier = 1) {
      const movement = Vector.from_magnitude_and_direction(this.velocity * multiplier, this.direction);
      this.position = Vector.add(this.position, movement);
    }

    public isGoingSouth() {
      return Math.abs(this.direction) < Math.PI / 2;
    }

    public isGoingEast() {
      return this.direction > 0;
    }
  }

  return Movable as ComposableConstructor<typeof Movable, T>;
}
