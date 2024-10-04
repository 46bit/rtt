import { Vector } from '../vector';
import { Player } from '../player';
import { Structure, Projectile, IEntity, IEntityUpdateContext } from './lib';
import lodash from 'lodash';

export const TURRET_RANGE = 180;

export class Turret extends Structure {
  firingRate: number;
  updateCounter: number;

  constructor(position: Vector, player: Player, built: boolean) {
    super({
      position,
      collisionRadius: 5,
      player,
      built,
      buildCost: 600,
      fullHealth: 60,
      health: built ? 60 : 0,
      constructableByMobileUnits: true,
    });
    this.firingRate = 5;
    this.updateCounter = 0;
  }

  update(input: {enemies: IEntity[], context: IEntityUpdateContext}) {
    if (this.dead) {
      return;
    }
    this.updateCounter++;

    if (this.updateCounter >= this.firingRate) {
      const angleToFireProjectile = window.profiler.time("angle_to_nearest_enemy", () => this.angleToNearestEnemy(input.enemies));
      if (angleToFireProjectile == null) {
        return;
      }
      const projectile = new TurretProjectile(this.position, this.player!, angleToFireProjectile);
      this.player!.turretProjectiles.push(projectile);
      this.updateCounter = 0;
    }
  }

  protected angleToNearestEnemy(enemies: IEntity[]): number | null {
    const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(this.position, e.position).magnitude());
    if (nearestEnemy == null) {
      return null;
    }
    const offset = Vector.subtract(nearestEnemy.position, this.position);
    if (offset.magnitude() > TURRET_RANGE * 1.3) {
      return null;
    }
    return offset.angle();
  }
}

export class TurretProjectile extends Projectile {
  constructor(position: Vector, player: Player, direction: number) {
    const velocity = 5.5;
    super({
      player,
      position,
      direction,
      velocity: velocity,
      lifetime: TURRET_RANGE / velocity,
      collisionRadius: 4,
      health: 7,
      fullHealth: 7,
    })
  }
}
