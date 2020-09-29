import { IConstructableVehicleEntity, IProjectileEntity, physics } from '../lib';
import * as abilities from '../abilities';

export const ARTILLERY_RANGE = 210;

export interface IArtilleryTank extends IConstructableVehicleEntity {
  kind: "artilleryTank";
  updateCounter: number;
}

export const ArtilleryTankMetadata = {
  collisionRadius: 5,
  buildCost: 70,
  constructableByMobileUnits: false,
  fullHealth: 10,
  movementRate: 0.15,
  turnRate: 5.0 / 3.0,
  physics,
  firingRate: 75,
};

export interface IArtilleryTankProjectile extends IProjectileEntity {
  kind: "artilleryTankProjectile";
}

export const ArtilleryTankProjectileMetadata = {
  collisionRadius: 5,
  movementRate: 1.0,
  velocity: 1.8,
  fullHealth: 18,
  lifetime: ARTILLERY_RANGE / 1.8,
};
