import { Vector } from '../../vector';
import { IEntity } from '../lib/entity';
import { Physics } from '../lib/physics';
import { IMovableConfig, IMovable, newMovable } from './movable';

export interface IManoeuverableConfig extends IMovableConfig {
  physics?: Physics;
}

export interface IManoeuverable extends IMovable {
  physics: Physics;
  angularVelocity: number;
}

export function newManoeuverable<E extends IEntity>(value: E, cfg: IManoeuverableConfig): E & IManoeuverable {
  return {
    ...newMovable(value, cfg),
    physics: cfg.physics ?? new Physics(),
    angularVelocity: 0,
  };
}

export function updateVelocity<E extends IManoeuverable>(value: E, turningAngle = 0, forceMultiplier = 1, stopForward = false, stopTurning = false): E {
  if (stopTurning) {
    turningAngle = value.physics.turningAngle() * Math.sign(value.angularVelocity)
  }

  // FIXME: Rename to Vector.fromMagnitudeAndDirection or similar
  const accelerationForces = Vector.from_magnitude_and_direction(value.physics.maxAccelerationForce(), turningAngle);
  accelerationForces.y *= forceMultiplier;
  if (stopTurning) {
    accelerationForces.x = -dragForce(value, accelerationForces.x, value.angularVelocity);
  }
  if (stopForward) {
    accelerationForces.y = -dragForce(value, accelerationForces.y, value.velocity);
  }
  value.angularVelocity += accelerationForces.x / value.physics.mass;
  value.velocity += accelerationForces.y / value.physics.mass;
  return value;
}

export function updateDirection<E extends IManoeuverable>(value: E, multiplier = 1.0): E {
  value.direction += value.angularVelocity * multiplier;
  // Normalise @direction to keep within [-PI, PI]
  if (value.direction < -Math.PI) {
    value.direction += Math.PI * 2;
  }
  if (value.direction > Math.PI) {
    value.direction -= Math.PI * 2;
  }
  return value;
}

export function shouldTurnLeftToReach(value: IManoeuverable, destination: Vector): boolean {
  const offset = Vector.subtract(destination, value.position);
  return Math.sin(offset.angle() - value.direction) < -0;
}

export function shouldTurnRightToReach(value: IManoeuverable, destination: Vector): boolean {
  const offset = Vector.subtract(destination, value.position);
  return Math.sin(offset.angle() - value.direction) > 0;
}

export function dragForce(value: IManoeuverable, force: number, velocity: number): number {
  const clippedForce = Math.min(
    Math.abs(force),
    value.physics.momentum(Math.abs(value.velocity)),
  );
  return clippedForce * (velocity == 0 ? 1 : Math.sign(velocity));
}

export function applyDragForces<E extends IManoeuverable>(value: E): E {
  value.velocity -= dragForce(value, value.physics.airResistance(value.velocity), value.velocity);
  value.angularVelocity -= dragForce(value, value.physics.airResistance(value.angularVelocity), value.angularVelocity);

  const rollingResistanceForces = value.physics.rollingResistanceForces(value.velocity, value.angularVelocity);
  value.velocity -= dragForce(value, rollingResistanceForces.x, value.velocity);
  value.angularVelocity -= dragForce(value, rollingResistanceForces.y, value.angularVelocity);

  return value;
}
