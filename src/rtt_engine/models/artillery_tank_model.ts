import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableVehicleModel, ProjectileModel, VehicleController, newEntity } from '../lib';
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
