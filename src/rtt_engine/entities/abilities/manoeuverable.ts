import { Vector } from '../../vector';
import { Entity, IEntity } from '../lib/entity';
import { Physics } from '../lib/physics';
import { IMovableConfig, Movable } from './movable';
import { ComposableConstructor } from '../lib/mixins';

export interface IManoeuverableConfig extends IMovableConfig {
  physics: Physics;
}

export interface IManoeuvrable extends IEntity {
  physics: Physics;
  angularVelocity: number;
}

export function Manoeuvrable<T extends new(o: any) => any>(base: T) {
  class Manoeuvrable extends Movable(base as new(o: any) => Entity) implements IManoeuvrable {
    public physics: Physics;
    public angularVelocity: number;

    constructor(cfg: IManoeuverableConfig & IMovableConfig) {
      super(cfg);
      this.physics = cfg.physics == null ? new Physics() : cfg.physics;
      this.angularVelocity = 0;
    }

    public updateVelocity(turningAngle = 0, forceMultiplier = 1, stopForward = false, stopTurning = false) {
      if (stopTurning) {
        turningAngle = this.physics.turningAngle() * Math.sign(this.angularVelocity)
      }

      // FIXME: Rename to Vector.fromMagnitudeAndDirection or similar
      const accelerationForces = Vector.from_magnitude_and_direction(this.physics.maxAccelerationForce(), turningAngle);
      accelerationForces.y *= forceMultiplier;
      if (stopTurning) {
        accelerationForces.x = -this.dragForce(accelerationForces.x, this.angularVelocity);
      }
      if (stopForward) {
        accelerationForces.y = -this.dragForce(accelerationForces.y, this.velocity);
      }
      this.angularVelocity += accelerationForces.x / this.physics.mass;
      this.velocity += accelerationForces.y / this.physics.mass;
    }

    public updateDirection(multiplier = 1.0) {
      this.direction += this.angularVelocity * multiplier;
      // Normalise @direction to keep within [-PI, PI]
      if (this.direction < -Math.PI) {
        this.direction += Math.PI * 2;
      }
      if (this.direction > Math.PI) {
        this.direction -= Math.PI * 2;
      }
    }

    public shouldTurnLeftToReach(destination: Vector) {
      const offset = Vector.subtract(destination, this.position);
      return Math.sin(offset.angle() - this.direction) < -0;
    }

    public shouldTurnRightToReach(destination: Vector) {
      const offset = Vector.subtract(destination, this.position);
      return Math.sin(offset.angle() - this.direction) > 0;
    }

    protected dragForce(force: number, velocity: number) {
      const clippedForce = Math.min(
        Math.abs(force),
        this.physics.momentum(Math.abs(this.velocity)),
      );
      return clippedForce * (velocity == 0 ? 1 : Math.sign(velocity));
    }

    protected applyDragForces() {
      this.velocity -= this.dragForce(this.physics.airResistance(this.velocity), this.velocity);
      this.angularVelocity -= this.dragForce(this.physics.airResistance(this.angularVelocity), this.angularVelocity);

      const rollingResistanceForces = this.physics.rollingResistanceForces(this.velocity, this.angularVelocity);
      this.velocity -= this.dragForce(rollingResistanceForces.x, this.velocity);
      this.angularVelocity -= this.dragForce(rollingResistanceForces.y, this.angularVelocity);
    }
  }

  return Manoeuvrable as ComposableConstructor<typeof Manoeuvrable, T>;
}
