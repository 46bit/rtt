import { Player } from '../player';
import { Vector } from '../vector';
import { Vehicle, IEntity, Projectile } from './lib';
import { IKillable } from './abilities';
import lodash from 'lodash';

export const SHOTGUN_RANGE = 80;

export class ShotgunTank extends Vehicle {
  firingRate: number;
  updateCounter: number;

  constructor(position: Vector, direction: number, player: Player, built: boolean) {
    super({
      position,
      direction,
      collisionRadius: 8,
      built,
      buildCost: 400,
      player,
      fullHealth: 35,
      health: built ? 35 : 0,
      movementRate: 0.07,
      turnRate: 4.0 / 3.0,
    } as any);
    this.firingRate = 40;
    this.updateCounter = 0;
  }

  update(enemies: IEntity[]) {
    if (this.dead) {
      return;
    }
    super.update();
    this.updateCounter++;

    if (this.updateCounter >= this.firingRate) {
      const angleToFireProjectile = this.angleToNearestEnemy(enemies);
      if (angleToFireProjectile == null) {
        return;
      }
      for (let projectileOffsetAngle = -4.8; projectileOffsetAngle <= 4.8; projectileOffsetAngle += 2.4) {
        const projectile = new ShotgunProjectile(this.position, this.player!, angleToFireProjectile + projectileOffsetAngle*Math.PI/180);
        this.player!.turretProjectiles.push(projectile);
      }
      this.updateCounter = 0;
    }
  }

  protected angleToNearestEnemy(enemies: IEntity[]): number | null {
    const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(this.position, e.position).magnitude());
    if (nearestEnemy == null) {
      return null;
    }
    const offset = Vector.subtract(nearestEnemy.position, this.position);
    if (offset.magnitude() > SHOTGUN_RANGE * 1.2) {
      return null;
    }
    return offset.angle();
  }

  protected attack(attackOrder: { target: IEntity & IKillable }): boolean {
    if (attackOrder.target.dead) {
      return false;
    }
    const distance = Vector.subtract(this.position, attackOrder.target.position).magnitude();
    if (distance > SHOTGUN_RANGE) {
      this.manoeuvre({ destination: attackOrder.target.position });
    }
    return true;
  }
}

export class ShotgunProjectile extends Projectile {
  constructor(position: Vector, player: Player, direction: number) {
    super({
      player,
      position,
      direction,
      velocity: 6.5,
      lifetime: SHOTGUN_RANGE / 5,
      collisionRadius: 3,
      health: 2.5,
      fullHealth: 2.5,
    })
  }
}

