import { Player, Vector } from '../';
import * as abilities from './abilities';
import { IVehicleMetadata, IVehicleState, newVehicle } from './';

export const ARTILLERY_RANGE = 210;

export type IArtilleryTankMetadata = IVehicleMetadata;

export interface IArtilleryTankState extends IVehicleState {
  kind: "artilleryTank";
}

export function newArtilleryTank(position: Vector, player: Player | null): IArtilleryTankState {
  const kind = "artilleryTank";
  return {
    kind,
    ...newVehicle(kind, position, player),
  };
}

// import { Player } from '../player';
// import { Vector } from '../vector';
// import { Vehicle, IEntity, Projectile, IEntityUpdateContext } from './lib';
// import { AttackOrder } from './abilities';
// import lodash from 'lodash';

// export const ARTILLERY_RANGE = 210;

// export class ArtilleryTank extends Vehicle {
//   firingRate: number;
//   updateCounter: number;

//   constructor(position: Vector, direction: number, player: Player, built: boolean) {
//     super({
//       position,
//       direction,
//       collisionRadius: 9,
//       built,
//       buildCost: 500,
//       player,
//       fullHealth: 50,
//       health: built ? 50 : 0,
//       movementRate: 0.04,
//       turnRate: 4.0 / 3.0,
//     } as any);
//     this.firingRate = 75;
//     this.updateCounter = 0;
//   }

//   update(input: {enemies: IEntity[], context: IEntityUpdateContext}) {
//     if (this.dead) {
//       return;
//     }
//     super.update(input);
//     this.updateCounter++;

//     if (this.updateCounter >= this.firingRate && this.velocity == 0) {
//       const angleToFireProjectile = this.angleToNearestEnemy(input.enemies);
//       if (angleToFireProjectile == null) {
//         return;
//       }
//       const projectile = new ArtilleryProjectile(this.position, this.player!, angleToFireProjectile);
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
//     if (offset.magnitude() > ARTILLERY_RANGE * 1.1) {
//       return null;
//     }
//     return offset.angle();
//   }

//   protected attack(attackOrder: AttackOrder): boolean {
//     if (attackOrder.target.dead) {
//       return false;
//     }
//     const distance = Vector.subtract(this.position, attackOrder.target.position).magnitude();
//     if (distance > ARTILLERY_RANGE) {
//       this.manoeuvre({ destination: attackOrder.target.position, context: attackOrder.context });
//     }
//     return true;
//   }
// }
