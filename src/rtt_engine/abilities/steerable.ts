import { Vector } from '../../vector';
import { IEntityMetadata, IEntityState } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';
import { IPhysics, turningAngle, maxAccelerationForce, airResistance, rollingResistanceForces, momentum } from '../lib/physics';
import { MovableUnits, IMovableMetadata, IMovableState } from './movable';

export type SteerableUnits = KindsOfUnitsWithAbility<ISteerableMetadata>;
export interface ISteerableMetadata extends IMovableMetadata {
  turnRate: number;
  physics: IPhysics;
}

export interface ISteerableState extends IMovableState {
  kind: SteerableUnits;
  angularVelocity: number;
}

export type ISteerableStateFields = Omit<ISteerableState, keyof IMovableState>;
export function newSteerable<K extends SteerableUnits>(kind: K, cfg?: {angularVelocity?: number}): ISteerableStateFields {
  return { angularVelocity: cfg?.angularVelocity ?? 0 };
}

export function updateVelocity<T extends ISteerableState>(value: T, turningAngle_ = 0, forceMultiplier = 1, stopForward = false, stopTurning = false): T {
  const physics = UnitMetadata[value.kind].physics;

  if (stopTurning) {
    turningAngle_ = turningAngle(physics) * Math.sign(value.angularVelocity)
  }

  // FIXME: Rename to Vector.fromMagnitudeAndDirection or similar
  const accelerationForces = Vector.from_magnitude_and_direction(maxAccelerationForce(physics), turningAngle_);
  accelerationForces.y *= forceMultiplier;
  if (stopTurning) {
    accelerationForces.x = -dragForce(value, accelerationForces.x, value.angularVelocity);
  }
  if (stopForward) {
    accelerationForces.y = -dragForce(value, accelerationForces.y, value.velocity);
  }
  value.angularVelocity += accelerationForces.x / physics.mass;
  value.velocity += accelerationForces.y / physics.mass;
  return value;
}

export function updateDirection<T extends ISteerableState>(value: T): T {
  value.direction += value.angularVelocity * UnitMetadata[value.kind].turnRate;
  // Normalise @direction to keep within [-PI, PI]
  if (value.direction < -Math.PI) {
    value.direction += Math.PI * 2;
  }
  if (value.direction > Math.PI) {
    value.direction -= Math.PI * 2;
  }
  return value;
}

export function shouldTurnLeftToReach(value: ISteerableState, destination: Vector): boolean {
  const offset = Vector.subtract(destination, value.position);
  return Math.sin(offset.angle() - value.direction) < -0;
}

export function shouldTurnRightToReach(value: ISteerableState, destination: Vector): boolean {
  const offset = Vector.subtract(destination, value.position);
  return Math.sin(offset.angle() - value.direction) > 0;
}

export function dragForce(value: ISteerableState, force: number, velocity: number): number {
  const clippedForce = Math.min(
    Math.abs(force),
    momentum(UnitMetadata[value.kind].physics, Math.abs(value.velocity)),
  );
  return clippedForce * (velocity == 0 ? 1 : Math.sign(velocity));
}

export function applyDragForces<E extends ISteerableState>(value: E): E {
  const physics = UnitMetadata[value.kind].physics;
  value.velocity -= dragForce(value, airResistance(physics, value.velocity), value.velocity);
  value.angularVelocity -= dragForce(value, airResistance(physics, value.angularVelocity), value.angularVelocity);

  const rollingResistanceForces_ = rollingResistanceForces(physics, value.velocity, value.angularVelocity);
  value.velocity -= dragForce(value, rollingResistanceForces_.x, value.velocity);
  value.angularVelocity -= dragForce(value, rollingResistanceForces_.y, value.angularVelocity);

  return value;
}
