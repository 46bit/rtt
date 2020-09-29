import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableVehicleModel, ProjectileModel, newEntity, newVehicleTurret } from '../lib';
import {
  IShotgunTank,
  IShotgunTankProjectile,
  ShotgunTankMetadata,
  ShotgunTankProjectileMetadata,
} from '../entities';

export class ShotgunTankModel extends ConstructableVehicleModel<IShotgunTank> {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): IShotgunTank {
    const entity: any = this.newConstructableVehicle({...cfg, kind: "shotgunTank"});
    entity.updateCounter = 0;
    entity.turret = newVehicleTurret({...ShotgunTankMetadata.turretInput, rotation: entity.direction});
    return entity as IShotgunTank;
  }
}

export class ShotgunTankProjectileModel extends ProjectileModel<IShotgunTankProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): IShotgunTankProjectile {
    return this.newProjectileEntity({...cfg, kind: "shotgunTankProjectile"});
  }
}
