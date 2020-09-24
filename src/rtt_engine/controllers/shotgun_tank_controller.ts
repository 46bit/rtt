import { Player, Vector } from '../';
import { IShotgunTank, IShotgunTankKind, ShotgunTankMetadata } from '../entities';
import * as abilities from '../abilities';

export class ShotgunTankController extends Controller<IShotgunTank> {
  readonly kind = IShotgunTankKind;
  readonly entityMetadata = ShotgunTankMetadata;

  newEntity(position: Vector, player: Player): IShotgunTank {
    const kind = "shotgunTank";
    const turret = newVehicleTurret(...this.entityMetadata.turretInput);
    const updateCounter = 0;
    return {kind, turret, updateCounter, ...newVehicle(kind, position, player)};
  }

  updateEntities(shotgunTanks: IShotgunTank[], ctx: IEntityUpdateContext): IShotgunTank[] {
    return shotgunTanks;
  }

  protected updateEntity(entity: IShotgunTank, ctx: IEntityUpdateContext) {
    if (entity.dead) {
      return;
    }

    this.updateOrders(entity, ctx);
    this.updateMovement(entity, ctx.pathfinder);

    entity.updateCounter++;

    const angleToFireProjectile = angleToNearestEnemy(entity, ctx.nearbyEnemies);
    if (angleToFireProjectile == null) {
      value.turret.update(entity.direction);
      return;
    }
    this.updateTurretTowards(entity, 0, angleToFireProjectile[0]);

    if (entity.updateCounter >= this.entityMetadata.firingRate && angleToFireProjectile[1] <= this.entityMetadata.firingRange * 1.2) {
      for (let projectileOffsetAngle = -4.8; projectileOffsetAngle <= 4.8; projectileOffsetAngle += 2.4) {
        const projectileAngle = entity.turret.rotation + projectileOffsetAngle*Math.PI/180;
        const projectile = newProjectile("shotgunProjectile", entity.position, projectileAngle, entity.player);
        // FIXME: It's clear that player isn't optional. Make it mandatory on most things?
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

export function angleToNearestEnemy(value: IShotgunTankState, enemies: IEntityState[]): [number, number] | null {
  const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(value.position, e.position).magnitude());
  if (nearestEnemy == null) {
    return null;
  }
  const offset = Vector.subtract(nearestEnemy.position, value.position);
  if (offset.magnitude() > SHOTGUN_RANGE * 2) {
    return null;
  }
  return [offset.angle(), offset.magnitude()];
}
