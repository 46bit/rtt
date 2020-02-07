import { Player } from '../player';
import { Vector } from '../vector';
import { Vehicle, IEntity, Projectile } from './lib';
import { IKillable } from './abilities';
import lodash from 'lodash';

export const ARTILLERY_RANGE = 190;

export class ArtilleryTank extends Vehicle {
  firingRate: number;
  updateCounter: number;

  constructor(position: Vector, direction: number, player: Player, built: boolean) {
    super({
      position,
      direction,
      collisionRadius: 9,
      built,
      buildCost: 500,
      player,
      fullHealth: 50,
      health: built ? 50 : 0,
      movementRate: 0.04,
      turnRate: 4.0 / 3.0,
    } as any);
    this.firingRate = 75;
    this.updateCounter = 0;
  }

  update(enemies: IEntity[]) {
    if (this.dead) {
      return;
    }
    super.update();
    this.updateCounter++;

    if (this.updateCounter >= this.firingRate && this.velocity == 0) {
      const angleToFireProjectile = this.angleToNearestEnemy(enemies);
      if (angleToFireProjectile == null) {
        return;
      }
      const projectile = new ArtilleryProjectile(this.position, this.player!, angleToFireProjectile);
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
    if (offset.magnitude() > ARTILLERY_RANGE * 1.2) {
      return null;
    }
    return offset.angle();
  }

  protected attack(attackOrder: { target: IEntity & IKillable }): boolean {
    if (attackOrder.target.dead) {
      return false;
    }
    const distance = Vector.subtract(this.position, attackOrder.target.position).magnitude();
    if (distance > ARTILLERY_RANGE) {
      this.manoeuvre({ destination: attackOrder.target.position });
    }
    return true;
  }
}

export class ArtilleryProjectile extends Projectile {
  constructor(position: Vector, player: Player, direction: number) {
    super({
      player,
      position,
      direction,
      velocity: 1.8,
      lifetime: ARTILLERY_RANGE / 2,
      collisionRadius: 5,
      health: 18,
      fullHealth: 18,
    })
  }
}

