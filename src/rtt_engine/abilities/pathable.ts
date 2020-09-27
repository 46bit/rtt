import { Vector } from '..';
import { ISteerableMetadata, ISteerableEntity, SteerableModel, Pathfinder } from '.';
import { ComposableConstructor, IEntity, EntityMetadata, EntitiesWithMetadata, Model, turningAngle } from '../lib';

export interface IPathableMetadata extends ISteerableMetadata {
  //stopAtDistanceToDestination?: number;
  //dropWaypointAtDistance?: number;
}

export interface IPathableEntity extends ISteerableEntity {
  kind: EntitiesWithMetadata<IPathableMetadata>;
  route: Vector[] | null;
  destination: Vector | null;
}

export function PathableModel<E extends IPathableEntity, T extends new(o: any) => any>(base: T) {
  class Pathable extends SteerableModel(base as new(o: any) => Model<E>) {
    setPathDestination(entity: E, destination: Vector): E {
      entity.destination = destination;
      return entity;
    }

    updateMovement(entity: E, pathfinder: Pathfinder): E {
      this.updatePathing(entity, pathfinder);
      // FIXME: Drag should be applied after acceleration, but based on the previous velocity?
      this.applyDragForces(entity);
      this.updateDirection(entity);
      this.updatePosition(entity);
      return entity;
    }

    updatePathing(entity: E, pathfinder: Pathfinder): boolean {
      if (!entity.destination) {
        return false;
      }

      // FIXME: Play around with whether I can support optional fields on metadata
      const distanceToDestination = Vector.subtract(entity.position, entity.destination).magnitude();
      const stopAtDistanceToDestination = 10; //UnitMetadata[entity.kind].stopAtDistanceToDestination ?? 10;
      if (distanceToDestination < stopAtDistanceToDestination) {
        entity.destination = null;
        entity.route = null;
        return false;
      }

      // FIXME: Find a better way to know when to recompute paths
      if (!entity.route || entity.route.length == 0 || Math.random() < 0.1) {
        entity.route = pathfinder(entity.position, entity.destination);
      }
      if (!entity.route || entity.route.length == 0) {
        entity.destination = null;
        entity.route = null;
        return false;
      }

      // FIXME: Tidy up this logic. It's good to eliminate waypoints that are too close, but not like this
      let nextRouteDestination = entity.route[0];
      let distanceToNextRouteDestination = Vector.subtract(entity.position, nextRouteDestination).magnitude();
      const dropWaypointAtDistance = 5; //UnitMetadata[entity.kind].dropWaypointAtDistance ?? 5;
      while (distanceToNextRouteDestination < dropWaypointAtDistance) {
        entity.route.shift();
        if (entity.route.length == 0) {
          return true;
        }
        nextRouteDestination = entity.route[0];
        distanceToNextRouteDestination = Vector.subtract(entity.position, nextRouteDestination).magnitude();
      }

      if (this.shouldTurnLeftToReach(entity, nextRouteDestination) && Math.random() > 0.2) {
        this.updateVelocity(entity, -turningAngle(EntityMetadata[entity.kind].physics));
      } else if (this.shouldTurnRightToReach(entity, nextRouteDestination) && Math.random() > 0.2) {
        this.updateVelocity(entity, turningAngle(EntityMetadata[entity.kind].physics));
      } else {
        this.updateVelocity(entity, 0);
      }
      return true;
    }
  }

  return Pathable as ComposableConstructor<typeof Pathable, T>;
}
