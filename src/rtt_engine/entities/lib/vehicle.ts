import {
  IManoeuverableConfig,
  IManoeuverable,
  newManoeuverable,
  IKillable,
  ManoeuvreOrder,
  AttackOrder,
  PatrolOrder,
  GuardOrder,
  applyDragForces,
  updateOrders,
  updateDirection,
  updatePosition,
  updateVelocity,
  shouldTurnLeftToReach,
  shouldTurnRightToReach,
} from '../abilities';
import { IUnitConfig, IUnit, newUnit } from './unit';
import { IEntity, IEntityUpdateContext } from './entity';
import { Vector } from '../../vector';

export interface IVehicleConfig extends IUnitConfig, IManoeuverableConfig {
  movementRate: number;
  turnRate: number;
}

export interface IVehicle extends IUnit, IManoeuverable {
  movementRate: number;
  turnRate: number;
  route: Vector[] | null;
  routeTo: Vector | null;
}

export function newVehicle(cfg: IVehicleConfig): IVehicle {
  // FIXME: Feels weird to not pass these down to the abilities, yet also weird to define config
  // in two places
  cfg.constructableByMobileUnits = false;
  cfg.orderBehaviours = {
    manoeuvre: (o) => this.manoeuvre(o),
    attack: (o) => this.attack(o),
    patrol: (o) => this.patrol(o),
    ...cfg.orderBehaviours,
  };
  return {
    ...newManoeuverable(newUnit(cfg), cfg),
    movementRate: cfg.movementRate,
    turnRate: cfg.turnRate,
    route: null,
    routeTo: null,
  };
}

export function updateVehicle<E extends IVehicle>(value: E, input: {context: IEntityUpdateContext}): E {
  if (value.dead) {
    return value;
  }
  // FIXME: Drag should be applied after acceleration, but based on the previous velocity?
  applyDragForces(value);
  updateOrders(value, input);
  updateDirection(value, value.turnRate);
  updatePosition(value, value.movementRate);
  return value;
}

export function vehicleManoeuvre<E extends IVehicle>(value: E, manoeuvreOrder: ManoeuvreOrder): boolean {
  const distanceToDestination = Vector.subtract(value.position, manoeuvreOrder.destination).magnitude();
  if (distanceToDestination < 10) {
    value.routeTo = null;
    return false;
  }

  if (!value.routeTo || !value.route || value.route.length == 0 || !value.routeTo.equals(manoeuvreOrder.destination) || Math.random() < 0.1) {
    // Find route
    value.routeTo = manoeuvreOrder.destination;
    value.route = manoeuvreOrder.context!.pathfinder(value.position, value.routeTo);
  }

  if (!value.route || value.route.length == 0) {
    value.routeTo = null;
    return false;
  }

  let nextRouteDestination = value.route[0];
  let distanceToNextRouteDestination = Vector.subtract(value.position, nextRouteDestination).magnitude();
  while (distanceToNextRouteDestination < 5) {
    value.route.shift();
    if (value.route.length == 0) {
      value.routeTo = null;
      return false;
    }
    nextRouteDestination = value.route[0];
    distanceToNextRouteDestination = Vector.subtract(value.position, nextRouteDestination).magnitude();
  }

  if (shouldTurnLeftToReach(value, nextRouteDestination) && Math.random() > 0.2) {
    updateVelocity(value, -value.physics.turningAngle());
  } else if (shouldTurnRightToReach(value, nextRouteDestination) && Math.random() > 0.2) {
    updateVelocity(value, value.physics.turningAngle());
  } else {
    updateVelocity(value, 0);
  }
  return true;
}

export function vehicleAttack<E extends IVehicle>(value: E, attackOrder: AttackOrder): boolean {
  if (attackOrder.target.dead) {
    return false;
  }
  vehicleManoeuvre(value, { destination: attackOrder.target.position, context: attackOrder.context });
  return true;
}

export function vehiclePatrol<E extends IVehicle>(value: E, patrolOrder: PatrolOrder): boolean {
  if (patrolOrder.range === undefined) {
    patrolOrder.range = value.collisionRadius;
  }
  const distanceToLocation = Vector.subtract(value.position, patrolOrder.location).magnitude();
  if (distanceToLocation <= patrolOrder.range) {
    // FIXME: Circle the location
    vehicleManoeuvre(value, { destination: patrolOrder.location, context: patrolOrder.context });
  } else {
    vehicleManoeuvre(value, { destination: patrolOrder.location, context: patrolOrder.context });
  }
  return true;
}
