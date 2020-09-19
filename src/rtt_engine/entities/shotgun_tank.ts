import { Player } from '../player';
import { Vector } from '../vector';
import { Vehicle, IEntity, Projectile, VehicleTurret, IEntityUpdateContext } from './lib';
import { AttackOrder } from './abilities';
import lodash from 'lodash';

export const SHOTGUN_RANGE = 80;

export class ShotgunTank extends Vehicle {
  firingRate: number;
  updateCounter: number;
  turret: VehicleTurret;

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
    this.turret = new VehicleTurret(0.08, 1, 0.8);
    this.turret.rotation = this.direction;
  }

  update(input: {enemies: IEntity[], context: IEntityUpdateContext}) {
    if (this.dead) {
      return;
    }
    super.update(input);
    this.updateCounter++;

    const angleToFireProjectile = this.angleToNearestEnemy(input.enemies);
    if (angleToFireProjectile == null) {
      this.turret.update(this.direction);
      return;
    }
    this.turret.updateTowards(0, angleToFireProjectile[0]);

    if (this.updateCounter >= this.firingRate && angleToFireProjectile[1] <= SHOTGUN_RANGE * 1.2) {
      for (let projectileOffsetAngle = -4.8; projectileOffsetAngle <= 4.8; projectileOffsetAngle += 2.4) {
        const projectile = new ShotgunProjectile(this.position, this.player!, this.turret.rotation + projectileOffsetAngle*Math.PI/180);
        this.player!.turretProjectiles.push(projectile);
      }
      this.updateCounter = 0;
    }
  }

  protected angleToNearestEnemy(enemies: IEntity[]): [number, number] | null {
    const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(this.position, e.position).magnitude());
    if (nearestEnemy == null) {
      return null;
    }
    const offset = Vector.subtract(nearestEnemy.position, this.position);
    if (offset.magnitude() > SHOTGUN_RANGE * 2) {
      return null;
    }
    return [offset.angle(), offset.magnitude()];
  }

  protected attack(attackOrder: AttackOrder): boolean {
    if (attackOrder.target.dead) {
      return false;
    }
    const distance = Vector.subtract(this.position, attackOrder.target.position).magnitude();
    if (distance > SHOTGUN_RANGE) {
      this.manoeuvre({ destination: attackOrder.target.position, context: attackOrder.context });
    }
    return true;
  }
}
