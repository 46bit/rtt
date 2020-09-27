import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableVehicleModel, ProjectileModel, newEntity, newVehicleTurret } from '../lib';
import { ITitan, ITitanProjectile, TitanMetadata, TitanProjectileMetadata } from '../entities';

export class TitanModel extends ConstructableVehicleModel<ITitan> {
  newEntity(cfg: {position: Vector, player: Player, built: false}): ITitan {
    const entity: any = this.newConstructableVehicle({...cfg, kind: "titan"});
    entity.updateCounter = 0;
    entity.turret = newVehicleTurret({...TitanMetadata.turretInput, rotation: entity.direction});
    return entity as ITitan;
  }
}

export class TitanProjectileModel extends ProjectileModel<ITitanProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): ITitanProjectile {
    return this.newProjectileEntity({...cfg, kind: "titanProjectile"});
  }
}
