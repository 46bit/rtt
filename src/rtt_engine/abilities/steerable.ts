import { Vector } from '..';
import { IMovableMetadata, IMovableEntity, MovableModel } from '.';
import { ComposableConstructor, EntitiesWithMetadata, EntityMetadata, Model } from '../lib';
import {
  IPhysics,
  turningAngle,
  maxAccelerationForce,
  airResistance,
  rollingResistanceForces,
  momentum,
} from '../entities/lib';

export interface ISteerableMetadata extends IMovableMetadata {
  turnRate: number;
  physics: IPhysics;
}

export interface ISteerableEntity extends IMovableEntity {
  kind: EntitiesWithMetadata<ISteerableMetadata>;
  angularVelocity: number;
}

export function SteerableModel<E extends ISteerableEntity, T extends new(o: any) => Model<E>>(base: T) {
  class Steerable extends MovableModel(base as new(o: any) => Model<E>) {
    updateVelocity(entity: E, turningAngle_ = 0, forceMultiplier = 1, stopForward = false, stopTurning = false): E {
      const physics = EntityMetadata[entity.kind].physics;

      if (stopTurning) {
        turningAngle_ = turningAngle(physics) * Math.sign(entity.angularVelocity)
      }

      // FIXME: Rename to Vector.fromMagnitudeAndDirection or similar
      const accelerationForces = Vector.from_magnitude_and_direction(maxAccelerationForce(physics), turningAngle_);
      accelerationForces.y *= forceMultiplier;
      if (stopTurning) {
        accelerationForces.x = -this.dragForce(entity, accelerationForces.x, entity.angularVelocity);
      }
      if (stopForward) {
        accelerationForces.y = -this.dragForce(entity, accelerationForces.y, entity.velocity);
      }
      entity.angularVelocity += accelerationForces.x / physics.mass;
      entity.velocity += accelerationForces.y / physics.mass;
      return entity;
    }

    updateDirection(entity: E): E {
      entity.direction += entity.angularVelocity * EntityMetadata[entity.kind].turnRate;
      // Normalise @direction to keep within [-PI, PI]
      if (entity.direction < -Math.PI) {
        entity.direction += Math.PI * 2;
      }
      if (entity.direction > Math.PI) {
        entity.direction -= Math.PI * 2;
      }
      return entity;
    }

    shouldTurnLeftToReach(entity: E, destination: Vector): boolean {
      const offset = Vector.subtract(destination, entity.position);
      return Math.sin(offset.angle() - entity.direction) < -0;
    }

    shouldTurnRightToReach(entity: E, destination: Vector): boolean {
      const offset = Vector.subtract(destination, entity.position);
      return Math.sin(offset.angle() - entity.direction) > 0;
    }

    dragForce(entity: E, force: number, velocity: number): number {
      const clippedForce = Math.min(
        Math.abs(force),
        momentum(EntityMetadata[entity.kind].physics, Math.abs(entity.velocity)),
      );
      return clippedForce * (velocity == 0 ? 1 : Math.sign(velocity));
    }

    applyDragForces(entity: E): E {
      const physics = EntityMetadata[entity.kind].physics;
      entity.velocity -= this.dragForce(entity, airResistance(physics, entity.velocity), entity.velocity);
      entity.angularVelocity -= this.dragForce(entity, airResistance(physics, entity.angularVelocity), entity.angularVelocity);

      const rollingResistanceForces_ = rollingResistanceForces(physics, entity.velocity, entity.angularVelocity);
      entity.velocity -= this.dragForce(entity, rollingResistanceForces_.x, entity.velocity);
      entity.angularVelocity -= this.dragForce(entity, rollingResistanceForces_.y, entity.angularVelocity);

      return entity;
    }
  }

  return Steerable as ComposableConstructor<typeof Steerable, T>;
}
