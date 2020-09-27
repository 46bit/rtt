import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableVehicleModel, ProjectileModel, newEntity } from '../lib';
import { ITitan, ITitanProjectile, TitanMetadata, TitanProjectileMetadata, newVehicleTurret } from '../entities';

export class TitanModel extends ConstructableVehicleModel<ITitan> {
  newEntity(cfg: {position: Vector, player: Player, built: false}): ITitan {
    return {
      ...this.newConstructableVehicle({...cfg, kind: "titan"}),
      updateCounter: 0,
      turret: newVehicleTurret(TitanMetadata.turretInput),
    };
  }
}

export class TitanProjectileModel extends ProjectileModel<ITitanProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): ITitanProjectile {
    return this.newProjectileEntity({...cfg, kind: "titanProjectile"});
  }
}
