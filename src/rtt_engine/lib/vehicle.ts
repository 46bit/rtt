import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller, EntityMetadata } from '.';
import { IBot, BotMetadata } from '../entities';

export type VehicleEntity =
  abilities.IConstructableEntity
  & abilities.IOwnableEntity
  & abilities.ICollidableEntity
  & abilities.IPathableEntity
  & abilities.IOrderableEntity;

export abstract class VehicleController<E extends VehicleEntity> extends abilities.OrderableController<E> {
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
