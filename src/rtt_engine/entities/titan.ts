import { IVehicleTurret, newPhysics } from '.';
import * as abilities from '../abilities';
import { IConstructableVehicleEntity, IProjectileEntity } from '../lib';

export const TITAN_RANGE = 150;

export interface ITitan extends IConstructableVehicleEntity {
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
