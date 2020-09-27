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
  firingRate: 5,
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
