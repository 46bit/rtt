import { Entity } from '../types/entity';
import { Vector } from '../../vector';

export interface IMovableConfig {
  velocity: number;
  direction: number;
}

export function Movable<T extends new(o: any) => any>(Base: T) {
  class Movable extends (Base as new(o: any) => Entity) {
    // FIXME: Store velocity as a Vector instead?
    velocity: number;
    direction: number;

    constructor(cfg: { velocity: number, direction: number }) {
      super(cfg);
      this.velocity = cfg.velocity;
      this.direction = cfg.direction;
    }

    updatePosition(multiplier = 1) {
      const movement = Vector.from_magnitude_and_direction(this.velocity * multiplier, this.direction);
      this.position.add(movement);
    }

    isGoingSouth() {
      return Math.abs(this.direction) < Math.PI / 2;
    }

    isGoingEast() {
      return this.direction > 0;
    }
  }

  return Movable as ComposableConstructor<typeof Movable, T>
}
