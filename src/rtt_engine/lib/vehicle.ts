import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller, EntityMetadata } from '.';
import { IBot, BotMetadata } from '../entities';

export type VehicleEntity =
  abilities.IConstructableEntity
  & abilities.IOwnableEntity
  & abilities.ICollidableEntity
  & abilities.IPathableEntity
  & abilities.IOrderableEntity
  & abilities.IConstructableEntity;

export abstract class VehicleController<E extends VehicleEntity> extends Controller<E> {
  updateOrders(entity: E, ctx: abilities.IEntityUpdateContext): E {
    abilities.OrderUnion.match(entity.orders[0], {
      manoeuvre: (o: abilities.ManoeuvreOrder) => this.updateManoeuvreOrder(entity, o, ctx),
      attack: (o: abilities.AttackOrder) => this.updateAttackOrder(entity, o, ctx),
      patrol: (o: abilities.PatrolOrder) => this.updatePatrolOrder(entity, o, ctx),
      guard: (o: abilities.GuardOrder) => this.updateGuardOrder(entity, o, ctx),
      constructStructure: (o: abilities.ConstructStructureOrder) => this.updateConstructStructureOrder(entity, o, ctx),
      constructVehicle: (o: abilities.ConstructVehicleOrder) => this.updateConstructVehicleOrder(entity, o, ctx),
      upgrade: (o: {}) => this.updateUpgradeOrder(entity, ctx),
    } as abilities.OrderMatchExhaustiveCases<boolean>);
    return entity;
  }

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

  updateGuardOrder(entity: E, order: abilities.GuardOrder, ctx: abilities.IEntityUpdateContext): boolean {
    return false;
  }

  updateConstructStructureOrder(entity: E, order: abilities.ConstructStructureOrder, ctx: abilities.IEntityUpdateContext): boolean {
    return false;
  }

  updateConstructVehicleOrder(entity: E, order: abilities.ConstructVehicleOrder, ctx: abilities.IEntityUpdateContext): boolean {
    return false;
  }

  updateUpgradeOrder(entity: E, ctx: abilities.IEntityUpdateContext): boolean {
    return false;
  }
}
