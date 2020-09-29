import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { newEntity } from '../lib';
import { ConstructableVehicleModel } from '../lib/vehicle';
import { ProjectileModel } from '../lib/projectile';
import {
  IArtilleryTank,
  IArtilleryTankProjectile,
  ArtilleryTankMetadata,
  ArtilleryTankProjectileMetadata,
} from '../entities';

export class ArtilleryTankModel extends ConstructableVehicleModel<IArtilleryTank> {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): IArtilleryTank {
    return {
      ...this.newConstructableVehicle({...cfg, kind: "artilleryTank"}),
      updateCounter: 0,
    };
  }
}

export class ArtilleryTankProjectileModel extends ProjectileModel<IArtilleryTankProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): IArtilleryTankProjectile {
    return this.newProjectileEntity({...cfg, kind: "artilleryTankProjectile"});
  }
}
