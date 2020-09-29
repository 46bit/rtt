import lodash from 'lodash';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller } from '../lib/controller';
import { ProjectileController } from '../lib/projectile';
import { Models, IEntity } from '../lib';
import { TURRET_RANGE, ITurretProjectile, ITurret, TurretMetadata } from '../entities';

export class TurretController extends Controller<ITurret> {
  updateEntities(entities: ITurret[], ctx: abilities.IEntityUpdateContext): ITurret[] {
    return entities;
  }

  updateEntity(entity: ITurret, ctx: abilities.IEntityUpdateContext): ITurret {
    if (entity.dead) {
      return entity;
    }
    entity.updateCounter++;

    if (entity.updateCounter >= TurretMetadata.firingRate) {
      const angleToFireProjectile = angleToNearestEnemy(entity, ctx.nearbyEnemies);
      if (angleToFireProjectile != null) {
        const projectile = Models["turretProjectile"].newEntity({
          position: entity.position,
          player: entity.player,
          direction: angleToFireProjectile,
        });
        entity.player.turretProjectiles.push(projectile);
        entity.updateCounter = 0;
      }
    }

    return entity;
  }
}

export class TurretProjectileController extends ProjectileController<ITurretProjectile> { }

function angleToNearestEnemy(entity: IEntity, enemies: IEntity[]): number | null {
  const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(entity.position, e.position).magnitude());
  if (nearestEnemy == null) {
    return null;
  }
  const offset = Vector.subtract(nearestEnemy.position, entity.position);
  if (offset.magnitude() > TURRET_RANGE * 1.3) {
    return null;
  }
  return offset.angle();
}
