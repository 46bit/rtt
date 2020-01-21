import { Entity } from '../types/entity';
import { Vector } from '../../vector';
import { IMovableConfig, Movable } from './movable';
import { Physics } from '../types/physics';

export interface IManoeuverableConfig extends IMovableConfig {
  physics: Physics;
  angularVelocity: number;
}

export function Manoeuvrable<T extends new(o: any) => any>(Base: T) {
  class Manoeuvrable extends Movable(Base as new(o: any) => Entity) {
    physics: Physics;
    angularVelocity: number;

    constructor(cfg: IManoeuverableConfig) {
      super(cfg);
      this.physics = cfg.physics;
      this.angularVelocity = cfg.angularVelocity;
    }

    updateVelocity(turningAngle = 0, forceMultiplier = 1, stop = false) {
      // FIXME: Drag should be applied after acceleration, but based on the previous velocity?
      this.applyDragForces()

      // FIXME: Rename to Vector.fromMagnitudeAndDirection or similar
      let accelerationForces = Vector.from_magnitude_and_direction(this.physics.maxAccelerationForce, turningAngle);
      accelerationForces.y *= forceMultiplier;
      if (stop) {
        accelerationForces.x -= this.dragForce(accelerationForces.x, this.angularVelocity);
        accelerationForces.y -= this.dragForce(accelerationForces.y, this.velocity);
      }
      this.angularVelocity += accelerationForces.x / this.physics.mass;
      this.velocity += accelerationForces.y / this.physics.mass;
    }

    updateDirection(multiplier = 1.0) {
      this.direction += this.angularVelocity * multiplier
      // Normalise @direction to keep within [-PI, PI]
      if (this.direction < -Math.PI) {
        this.direction += Math.PI * 2
      }
      if (this.direction > Math.PI) {
        this.direction -= Math.PI * 2
      }
    }

    shouldTurnLeftToReach(destination: Vector) {
      const angle = Vector.angleBetween(this.position, destination);
      return (this.direction - angle) % (Math.PI * 2) > Math.PI;
    }

    shouldTurnRightToReach(destination: Vector) {
      const angle = Vector.angleBetween(this.position, destination);
      return (this.direction - angle) % (Math.PI * 2) < Math.PI;
    }

    protected dragForce(force: number, velocity: number) {
      const clippedForce = Math.min(
        Math.abs(force),
        this.physics.momentum(Math.abs(this.velocity))
      );
      return clippedForce * Math.sign(velocity);
    }

    protected applyDragForces() {
      this.velocity -= this.dragForce(this.physics.airResistance(this.velocity), this.velocity);
      this.angularVelocity -= this.dragForce(this.physics.airResistance(this.angularVelocity), this.angularVelocity);

      const rollingResistanceForces = this.physics.rollingResistanceForces(this.velocity, this.angularVelocity);
      this.velocity -= this.dragForce(rollingResistanceForces.x, this.velocity);
      this.angularVelocity -= this.dragForce(rollingResistanceForces.y, this.angularVelocity);
    }
  }

  return Manoeuvrable as ComposableConstructor<typeof Manoeuvrable, T>
}
