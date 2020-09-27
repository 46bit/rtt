import * as abilities from '../abilities';
import { IConstructableVehicleEntity, IProjectileEntity, IVehicleTurret, newPhysics } from '../lib';

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
  turretInput: {
    turnRate: 0.08,
    force: 1,
    friction: 0.8
  },
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
