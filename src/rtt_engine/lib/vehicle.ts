import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Model, Controller, EntityMetadata, newEntity } from '.';

export type IVehicleEntity =
  abilities.IKillableEntity
  & abilities.IOwnableEntity
  & abilities.ICollidableEntity
  & abilities.IPathableEntity
  & abilities.IOrderableEntity;
export type IConstructableVehicleEntity = IVehicleEntity & abilities.IConstructableEntity;

export abstract class VehicleModel<E extends IVehicleEntity> extends abilities.KillableModel(
    abilities.OwnableModel(
      abilities.PathableModel(Model))) {
  newVehicle(cfg: {kind: E["kind"], position: Vector, player: Player}): IVehicleEntity & {kind: E["kind"]} {
    return {
      ...newEntity({kind: cfg.kind, position: cfg.position}),
      health: EntityMetadata[cfg.kind].fullHealth,
      dead: false,
      player: cfg.player,
      destination: null,
      route: null,
      angularVelocity: 0,
      velocity: 0,
      direction: Math.random(),
      orders: [],
    };
  }
}

export abstract class ConstructableVehicleModel<E extends IConstructableVehicleEntity> extends abilities.ConstructableModel(
    abilities.OwnableModel(
      abilities.PathableModel(Model))) {
  newConstructableVehicle(cfg: {kind: E["kind"], position: Vector, player: Player, built: boolean}): IConstructableVehicleEntity & {kind: E["kind"]} {
    return {
      ...newEntity({kind: cfg.kind, position: cfg.position}),
      health: cfg.built ? EntityMetadata[cfg.kind].fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      destination: null,
      route: null,
      angularVelocity: 0,
      velocity: 0,
      direction: Math.random(),
      orders: [],
    };
  }
}

export abstract class VehicleController<E extends IVehicleEntity> extends abilities.OrderableController<E> {
  updateManoeuvreOrder(entity: E, order: abilities.ManoeuvreOrder, ctx: abilities.IEntityUpdateContext): boolean {
    const stopAtDistanceToDestination = 10; //UnitMetadata[value.kind].stopAtDistanceToDestination ?? 10;
    const distanceToDestination = Vector.subtract(entity.position, order.destination).magnitude();
    if (distanceToDestination > stopAtDistanceToDestination) {
      entity.destination = order.destination;
      return true;
    }
    return false;
  }

  updateAttackOrder(entity: E, order: abilities.AttackOrder, ctx: abilities.IEntityUpdateContext): boolean {
    if (order.target.dead) {
      return false;
    }
    this.updateManoeuvreOrder(entity, {destination: order.target.position}, ctx);
    return true;
  }

  updatePatrolOrder(entity: E, order: abilities.PatrolOrder, ctx: abilities.IEntityUpdateContext): boolean {
    if (order.range == null) {
      order.range = EntityMetadata[entity.kind].collisionRadius;
    }
    const distanceToLocation = Vector.subtract(entity.position, order.location).magnitude();
    if (distanceToLocation <= order.range) {
      // FIXME: Circle the location
      this.updateManoeuvreOrder(entity, {destination: order.location}, ctx);
    } else {
      this.updateManoeuvreOrder(entity, {destination: order.location}, ctx);
    }
    return true;
  }
}
