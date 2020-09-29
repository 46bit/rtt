import { Vector } from '..';
import { ComposableConstructor, IEntity, EntityMetadata, EntitiesWithMetadata } from '../lib';
import { Model } from '../lib/model';

export type Pathfinder = (from: Vector, to: Vector) => Vector[] | null;

export interface IEntityUpdateContext {
  pathfinder: Pathfinder;
  nearbyEnemies: IEntity[];
}

export interface IMovableMetadata {
  movementRate: number;
}

export interface IMovableEntity extends IEntity {
  kind: EntitiesWithMetadata<IMovableMetadata>;
  velocity: number;
  direction: number;
}

export function MovableModel<E extends IMovableEntity, T extends new(o: any) => any>(base: T) {
  class Movable extends (base as new(o: any) => Model<E>) {
    updatePosition(entity: E): E {
      const speed = entity.velocity * EntityMetadata[entity.kind].movementRate;
      const velocityVector = Vector.from_magnitude_and_direction(speed, entity.direction);
      entity.position = Vector.add(entity.position, velocityVector);
      return entity;
    }

    isGoingSouth(entity: IMovableEntity): boolean {
      return Math.abs(entity.direction) < Math.PI / 2;
    }

    isGoingEast(entity: IMovableEntity): boolean {
      return entity.direction > 0;
    }
  }

  return Movable as ComposableConstructor<typeof Movable, T>;
}
