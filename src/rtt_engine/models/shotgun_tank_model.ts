import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableVehicleModel, ProjectileModel, newEntity } from '../lib';
import {
  IShotgunTank,
  IShotgunTankProjectile,
  ShotgunTankMetadata,
  ShotgunTankProjectileMetadata,
  newVehicleTurret,
} from '../entities';

export class ShotgunTankModel extends ConstructableVehicleModel<IShotgunTank> {
  newEntity(cfg: {position: Vector, player: Player, built: false}): IShotgunTank {
    return {
      ...this.newConstructableVehicle({...cfg, kind: "shotgunTank"}),
      updateCounter: 0,
      turret: newVehicleTurret(ShotgunTankMetadata.turretInput),
    };
  }
}

export class ShotgunTankProjectileModel extends ProjectileModel<IShotgunTankProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): IShotgunTankProjectile {
    return this.newProjectileEntity({...cfg, kind: "shotgunTankProjectile"});
  }
}
