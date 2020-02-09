import { Player } from '../player';
import { Vector } from '../vector';
import { Vehicle, IEntity, Projectile } from './lib';
import { IKillable } from './abilities';
import lodash from 'lodash';

export const TITAN_RANGE = 150;

export class Titan extends Vehicle {
  firingRate: number;
  updateCounter: number;

  constructor(position: Vector, direction: number, player: Player, built: boolean) {
    super({
      position,
      direction,
      collisionRadius: 16,
      built,
      buildCost: 4000,
      player,
      fullHealth: 700,
      health: built ? 700 : 0,
      movementRate: 0.05,
      turnRate: 3.0 / 3.0,
    } as any);
    this.firingRate = 7;
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
      for (let projectileOffsetAngle = -6; projectileOffsetAngle <= 6; projectileOffsetAngle += 3) {
        const projectile = new TitanProjectile(this.position, this.player!, angleToFireProjectile + projectileOffsetAngle*Math.PI/180);
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
    if (offset.magnitude() > TITAN_RANGE * 1.2) {
      return null;
    }
    return offset.angle();
  }

  protected attack(attackOrder: { target: IEntity & IKillable }): boolean {
    if (attackOrder.target.dead) {
      return false;
    }
    const distance = Vector.subtract(this.position, attackOrder.target.position).magnitude();
    if (distance > TITAN_RANGE) {
      this.manoeuvre({ destination: attackOrder.target.position });
    }
    return true;
  }
}

export class TitanProjectile extends Projectile {
  constructor(position: Vector, player: Player, direction: number) {
    super({
      player,
      position,
      direction,
      velocity: 9,
      lifetime: TITAN_RANGE / 9,
      collisionRadius: 3,
      health: 9,
      fullHealth: 9,
    })
  }
}
