import lodash from 'lodash';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController, EntityMetadata, IEntity, ProjectileController, Models, updateVehicleTurret, updateTurretTowards } from '../lib';
import { SHOTGUN_RANGE, IShotgunTank, ShotgunTankMetadata, IShotgunTankProjectile } from '../entities';

export class ShotgunTankController extends VehicleController<IShotgunTank> {
  readonly entityMetadata = ShotgunTankMetadata;

  updateEntities(shotgunTanks: IShotgunTank[], ctx: abilities.IEntityUpdateContext): IShotgunTank[] {
    return shotgunTanks;
  }

  protected updateEntity(entity: IShotgunTank, ctx: abilities.IEntityUpdateContext) {
    if (entity.dead) {
      return;
    }

    this.updateOrders(entity, ctx);
    Models["shotgunTank"].updateMovement(entity, ctx.pathfinder);

    entity.updateCounter++;

    const angleToFireProjectile = angleToNearestEnemy(entity, ctx.nearbyEnemies);
    if (angleToFireProjectile == null) {
      updateVehicleTurret(entity.turret, entity.direction);
      return;
    }
    updateTurretTowards(entity.turret, 0, angleToFireProjectile[0]);

    if (entity.updateCounter >= this.entityMetadata.firingRate && angleToFireProjectile[1] <= this.entityMetadata.firingRange * 1.2) {
      for (let projectileOffsetAngle = -4.8; projectileOffsetAngle <= 4.8; projectileOffsetAngle += 2.4) {
        const projectileAngle = entity.turret.rotation + projectileOffsetAngle*Math.PI/180;
        const projectile = Models["shotgunTankProjectile"].newEntity({
          position: entity.position,
          player: entity.player,
          direction: projectileAngle,
        });
        entity.player.turretProjectiles.push(projectile);
      }
      entity.updateCounter = 0;
    }
  }

  attackOrderBehaviour(entity: IShotgunTank, attackOrder: abilities.AttackOrder): boolean {
    if (attackOrder.target.dead) {
      return false;
    }
    const distance = Vector.subtract(entity.position, attackOrder.target.position).magnitude();
    if (distance > this.entityMetadata.firingRange) {
      entity.destination = attackOrder.target.position;
    }
    return true;
  }
}

function angleToNearestEnemy(entity: IShotgunTank, enemies: IEntity[]): [number, number] | null {
  const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(entity.position, e.position).magnitude());
  if (nearestEnemy == null) {
    return null;
  }
  const offset = Vector.subtract(nearestEnemy.position, entity.position);
  if (offset.magnitude() > SHOTGUN_RANGE * 2) {
    return null;
  }
  return [offset.angle(), offset.magnitude()];
}

export class ShotgunTankProjectileController extends ProjectileController<IShotgunTankProjectile> { }
