import { IVehicleTurret, newPhysics } from '.';
import * as abilities from '../abilities';
import { IProjectileEntity } from '../lib';

export const TITAN_RANGE = 150;

export interface ITitan extends abilities.IConstructableEntity, abilities.IOwnableEntity, abilities.ICollidableEntity, abilities.IPathableEntity {
  kind: "titan";
  updateCounter: number;
  turret: IVehicleTurret;
  laserStopAfter?: number;
}

export const TitanMetadata = {
  collisionRadius: 12,
  buildCost: 7000,
  constructableByMobileUnits: false,
  fullHealth: 700,
  movementRate: 0.03,
  turnRate: 1 / 3,
  physics: newPhysics(),
  turretInput: [0.05, 1, 0.8, 0],
};

export interface ITitanProjectile extends IProjectileEntity {
  kind: "titanProjectile";
}

export const TitanProjectileMetadata = {
  collisionRadius: 3,
  fullHealth: 9,
  lifetime: TITAN_RANGE / 9,
  velocity: 0,
  movementRate: 1,
};

//     this.turret2 = new VehicleTurret(0.05, 1, 0.8, 0);
//     this.turret2.rotation = this.direction;
//     this.laserStopAfter = undefined;
//   }

//   update(input: {enemies: (IKillable & ICollidable)[], context: IEntityUpdateContext}) {
//     if (this.dead) {
//       return;
//     }
//     super.update(input);

//     this.laserStopAfter = undefined;
//     const angleToFireProjectile = this.angleToNearestEnemy(input.enemies);
//     if (angleToFireProjectile == null) {
//       this.turret2.update(this.direction);
//       return;
//     }
//     this.turret2.updateTowards(0, angleToFireProjectile[0]);

//     if (angleToFireProjectile[1] < TITAN_RANGE) {
//       let p = this.position.clone();
//       let u = Vector.from_magnitude_and_direction(1, this.turret2.rotation);
//       for (let d = 0; d < TITAN_RANGE; d++) {
//         p.add(u);
//         let hitEnemies = input.enemies.filter((e) => !e.dead && Vector.distance(e.position, p) < e.collisionRadius);
//         if (hitEnemies.length > 0) {
//           for (let hitEnemy of hitEnemies) {
//             hitEnemy.damage(3 / hitEnemies.length);
//           }
//           this.laserStopAfter = d;
//           break;
//         }
//       }
//     }
//   }

//   protected angleToNearestEnemy(enemies: IEntity[]): [number, number] | null {
//     const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(this.position, e.position).magnitude());
//     if (nearestEnemy == null) {
//       return null;
//     }
//     const offset = Vector.subtract(nearestEnemy.position, this.position);
//     if (offset.magnitude() > TITAN_RANGE * 2) {
//       return null;
//     }
//     return [offset.angle(), offset.magnitude()];
//   }

//   protected attack(attackOrder: AttackOrder): boolean {
//     if (attackOrder.target.dead) {
//       return false;
//     }
//     const distance = Vector.subtract(this.position, attackOrder.target.position).magnitude();
//     if (distance > TITAN_RANGE) {
//       this.manoeuvre({ destination: attackOrder.target.position, context: attackOrder.context });
//     }
//     return true;
//   }
// }
