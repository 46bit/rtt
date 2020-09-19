import {
  ISteerableMetadata,
  ISteerableState,
  Pathfinder,
  applyDragForces,
  updateOrders,
  updateDirection,
  updatePosition,
  updateVelocity,
  shouldTurnLeftToReach,
  shouldTurnRightToReach,
} from '../abilities';
import { turningAngle } from '../lib';
import { Vector } from '../../vector';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export type PathableUnits = KindsOfUnitsWithAbility<IPathableMetadata>;
export interface IPathableMetadata extends ISteerableMetadata {
  //stopAtDistanceToDestination?: number;
  //dropWaypointAtDistance?: number;
}

export interface IPathableState extends ISteerableState {
  kind: PathableUnits;
  route: Vector[] | null;
  destination: Vector | null;
}

export type IPathableStateFields = Omit<IPathableState, keyof ISteerableState>;
export function newPathable<K extends PathableUnits>(kind: K): IPathableStateFields {
  return {
    route: null,
    destination: null,
  };
}

export function setPathDestination<T extends IPathableState>(value: T, destination: Vector): T {
  value.destination = destination;
  return value;
}

export function updateMovement<T extends IPathableState>(value: T, pathfinder: Pathfinder): T {
  updatePathing(value, pathfinder);
  // FIXME: Drag should be applied after acceleration, but based on the previous velocity?
  applyDragForces(value);
  updateDirection(value);
  updatePosition(value);
  return value;
}

export function updatePathing(value: IPathableState, pathfinder: Pathfinder): boolean {
  if (!value.destination) {
    return false;
  }

  // FIXME: Play around with whether I can support optional fields on metadata
  const distanceToDestination = Vector.subtract(value.position, value.destination).magnitude();
  const stopAtDistanceToDestination = 10; //UnitMetadata[value.kind].stopAtDistanceToDestination ?? 10;
  if (distanceToDestination < stopAtDistanceToDestination) {
    value.destination = null;
    value.route = null;
    return false;
  }

  // FIXME: Find a better way to know when to recompute paths
  if (!value.route || value.route.length == 0 || Math.random() < 0.1) {
    value.route = pathfinder(value.position, value.destination);
  }
  if (!value.route || value.route.length == 0) {
    value.destination = null;
    value.route = null;
    return false;
  }

  // FIXME: Tidy up this logic. It's good to eliminate waypoints that are too close, but not like this
  let nextRouteDestination = value.route[0];
  let distanceToNextRouteDestination = Vector.subtract(value.position, nextRouteDestination).magnitude();
  const dropWaypointAtDistance = 5; //UnitMetadata[value.kind].dropWaypointAtDistance ?? 5;
  while (distanceToNextRouteDestination < dropWaypointAtDistance) {
    value.route.shift();
    if (value.route.length == 0) {
      return true;
    }
    nextRouteDestination = value.route[0];
    distanceToNextRouteDestination = Vector.subtract(value.position, nextRouteDestination).magnitude();
  }

  if (shouldTurnLeftToReach(value, nextRouteDestination) && Math.random() > 0.2) {
    updateVelocity(value, -turningAngle(UnitMetadata[value.kind].physics));
  } else if (shouldTurnRightToReach(value, nextRouteDestination) && Math.random() > 0.2) {
    updateVelocity(value, turningAngle(UnitMetadata[value.kind].physics));
  } else {
    updateVelocity(value, 0);
  }
  return true;
}
