import lodash from 'lodash';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Models, IEntity } from '../lib';
import { VehicleController } from '../lib/vehicle';
import { ProjectileController } from '../lib/projectile';
import { ARTILLERY_RANGE, IArtilleryTank, ArtilleryTankMetadata, IArtilleryTankProjectile } from '../entities';

export class ArtilleryTankController extends VehicleController<IArtilleryTank> {
  updateEntities(entities: IArtilleryTank[], ctx: abilities.IEntityUpdateContext): IArtilleryTank[] {
    return entities.map((e) => this.updateEntity(e, ctx));
  }

  updateEntity(entity: IArtilleryTank, ctx: abilities.IEntityUpdateContext): IArtilleryTank {
    if (entity.dead) {
      return entity;
    }
    this.updateOrders(entity, ctx);
    entity.updateCounter++;

    if (entity.updateCounter >= ArtilleryTankMetadata.firingRate && entity.velocity == 0) {
      const angleToFireProjectile = angleToNearestEnemy(entity, ctx.nearbyEnemies);
      if (angleToFireProjectile == null) {
        return entity;
      }
      const projectile = Models["artilleryTankProjectile"].newEntity({
        position: entity.position,
        player: entity.player,
        direction: angleToFireProjectile,
      });
      entity.player.turretProjectiles.push(projectile);
      entity.updateCounter = 0;
    }
    return entity;
  }

  updateAttackOrder(entity: IArtilleryTank, order: abilities.AttackOrder, ctx: abilities.IEntityUpdateContext): boolean {
    if (order.target.dead) {
      return false;
    }
    const distance = Vector.subtract(entity.position, order.target.position).magnitude();
    if (distance > ARTILLERY_RANGE) {
      this.updateManoeuvreOrder(entity, {destination: order.target.position}, ctx);
    }
    return true;
  }
}

function angleToNearestEnemy(entity: IEntity, enemies: IEntity[]): number | null {
  const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(entity.position, e.position).magnitude());
  if (nearestEnemy == null) {
    return null;
  }
  const offset = Vector.subtract(nearestEnemy.position, entity.position);
  if (offset.magnitude() > ARTILLERY_RANGE * 1.1) {
    return null;
  }
  return offset.angle();
}

export class ArtilleryTankProjectileController extends ProjectileController<IArtilleryTankProjectile> { }
