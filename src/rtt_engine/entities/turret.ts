import { Vector } from '../vector';
import { Player } from '../player';
import { Structure, Projectile, IEntity } from './lib';
import lodash from 'lodash';

const TURRET_RANGE = 180;

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
      orderExecutionCallbacks: {},
    });
    this.firingRate = 5;
    this.updateCounter = 0;
  }

  update(enemies: IEntity[]) {
    if (this.dead) {
      return;
    }
    this.updateCounter++;

    if (this.updateCounter >= this.firingRate) {
      const angleToFireProjectile = this.angleToNearestEnemy(enemies);
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
    super({
      player,
      position,
      direction,
      velocity: 3.5,
      lifetime: TURRET_RANGE / 3.5,
      collisionRadius: 4,
      health: 7,
      fullHealth: 7,
    })
  }
}
