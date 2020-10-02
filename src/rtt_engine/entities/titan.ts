import * as abilities from '../abilities';
import { IConstructableVehicleEntity, IProjectileEntity, IVehicleTurret } from '../lib';
import { physics } from '../lib/physics';

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
  physics,
  turretInput: {
    turnRate: 0.05,
    force: 1,
    friction: 0.8,
    tolerance: 0,
  },
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
