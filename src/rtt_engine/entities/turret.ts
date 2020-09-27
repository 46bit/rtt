import { IVehicleTurret, newPhysics } from '.';
import * as abilities from '../abilities';
import { IProjectileEntity } from '../lib';

export const TURRET_RANGE = 180;

export interface ITurret extends abilities.IConstructableEntity, abilities.IOwnableEntity, abilities.ICollidableEntity {
  kind: "turret";
  updateCounter: number;
}

export const TurretMetadata = {
  collisionRadius: 5,
  buildCost: 600,
  constructableByMobileUnits: true,
  fullHealth: 60,
  movementRate: 0.07,
  turnRate: 4.0 / 3.0,
  physics: newPhysics(),
  firingRate: 5,
  turretInput: [0.08, 1, 0.8],
};

export interface ITurretProjectile extends IProjectileEntity {
  kind: "turretProjectile";
}

export const TurretProjectileMetadata = {
  collisionRadius: 4,
  velocity: 3.5,
  movementRate: 1.0,
  lifetime: TURRET_RANGE / 3.5,
  fullHealth: 7,
};

// export class Turret extends Structure {
//   firingRate: number;
//   updateCounter: number;

//   constructor(position: Vector, player: Player, built: boolean) {
//     super({
//       position,
//       collisionRadius: 5,
//       player,
//       built,
//       buildCost: 600,
//       fullHealth: 60,
//       health: built ? 60 : 0,
//       constructableByMobileUnits: true,
//     });
//     this.firingRate = 5;
//     this.updateCounter = 0;
//   }

//   update(input: {enemies: IEntity[], context: IEntityUpdateContext}) {
//     if (this.dead) {
//       return;
//     }
//     this.updateCounter++;

//     if (this.updateCounter >= this.firingRate) {
//       const angleToFireProjectile = this.angleToNearestEnemy(input.enemies);
//       if (angleToFireProjectile == null) {
//         return;
//       }
//       const projectile = new TurretProjectile(this.position, this.player!, angleToFireProjectile);
//       this.player!.turretProjectiles.push(projectile);
//       this.updateCounter = 0;
//     }
//   }

//   protected angleToNearestEnemy(enemies: IEntity[]): number | null {
//     const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(this.position, e.position).magnitude());
//     if (nearestEnemy == null) {
//       return null;
//     }
//     const offset = Vector.subtract(nearestEnemy.position, this.position);
//     if (offset.magnitude() > TURRET_RANGE * 1.3) {
//       return null;
//     }
//     return offset.angle();
//   }
// }
