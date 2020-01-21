export class Movable {
  // FIXME: Store velocity as a Vector instead?
  velocity: number;
  direction: number;

  constructMovable(velocity, direction) {
    this.velocity = velocity;
    this.direction = direction;
  }

  updatePosition(multiplier: 1)
    this.position += Vector.from_magnitude_and_direction(this.velocity * multiplier, this.direction);
  }

  isGoingSouth() {
    return Math.abs(this.direction) < Math.PI / 2;
  }

  isGoingEast() {
    return this.direction > 0;
  }
}
