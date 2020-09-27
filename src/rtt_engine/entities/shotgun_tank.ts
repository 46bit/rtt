import * as abilities from '../abilities';
import { IConstructableVehicleEntity, IProjectileEntity } from '../lib';
import { IVehicleTurret, newPhysics } from '.';

export const SHOTGUN_RANGE = 80;

export interface IShotgunTank extends IConstructableVehicleEntity {
  kind: "shotgunTank";
  updateCounter: number;
  turret: IVehicleTurret;
}

export const ShotgunTankMetadata = {
  collisionRadius: 8,
  buildCost: 400,
  constructableByMobileUnits: false,
  fullHealth: 35,
  movementRate: 0.07,
  turnRate: 4.0 / 3.0,
  physics: newPhysics(),
  firingRate: 40,
  firingRange: 80,
  turretInput: [0.08, 1, 0.8],
};

export interface IShotgunTankProjectile extends IProjectileEntity {
  kind: "shotgunTankProjectile";
}

export const ShotgunTankProjectileMetadata = {
  collisionRadius: 3,
  velocity: 6.5,
  movementRate: 1.0,
  lifetime: SHOTGUN_RANGE / 5,
  fullHealth: 2.5,
};

// export function newShotgunTank(position: Vector, player: Player | null): IShotgunTankState {
//   const kind = "shotgunTank";
//   const turret = new VehicleTurret(...UnitMetadata[kind].turretInput);
//   return {
//     kind,
//     turret,
//     updateCounter: 0,
//     ...newVehicle(kind, position, player),
//   };
// }

// export function updateShotgunTank(value: IShotgunTankState, ctx: {pathfinder: Pathfinder, nearbyEnemies: IEntityState[]}) {
//   if (value.dead) {
//     return value;
//   }

//   abilities.updateOrders(value, ctx);
//   abilities.updateMovement(value, ctx.pathfinder);

//   value.updateCounter++;
//   const angleToFireProjectile = angleToNearestEnemy(value, ctx.nearbyEnemies);
//   if (angleToFireProjectile == null) {
//     value.turret.update(value.direction);
//     return value;
//   }
//   value.turret.updateTowards(0, angleToFireProjectile[0]);

//   if (value.updateCounter >= UnitMetadata[value.kind].firingRate && angleToFireProjectile[1] <= SHOTGUN_RANGE * 1.2) {
//     for (let projectileOffsetAngle = -4.8; projectileOffsetAngle <= 4.8; projectileOffsetAngle += 2.4) {
//       const projectileAngle = value.turret.rotation + projectileOffsetAngle*Math.PI/180;
//       const projectile = newProjectile("shotgunProjectile", value.position, projectileAngle, value.player);
//       // FIXME: It's clear that player isn't optional. Make it mandatory on most things?
//       value.player!.turretProjectiles.push(projectile);
//     }
//     value.updateCounter = 0;
//   }

//   return value;
// }

// export function angleToNearestEnemy(value: IShotgunTankState, enemies: IEntityState[]): [number, number] | null {
//   const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(value.position, e.position).magnitude());
//   if (nearestEnemy == null) {
//     return null;
//   }
//   const offset = Vector.subtract(nearestEnemy.position, value.position);
//   if (offset.magnitude() > SHOTGUN_RANGE * 2) {
//     return null;
//   }
//   return [offset.angle(), offset.magnitude()];
// }

// export function attack(value: IShotgunTankState, attackOrder: abilities.AttackOrder): boolean {
//   if (attackOrder.target.dead) {
//     return false;
//   }
//   const distance = Vector.subtract(value.position, attackOrder.target.position).magnitude();
//   if (distance > SHOTGUN_RANGE) {
//     value.destination = attackOrder.target.position;
//   }
//   return true;
// }
