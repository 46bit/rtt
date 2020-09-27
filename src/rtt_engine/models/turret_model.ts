import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, ProjectileModel, newEntity } from '../lib';
import { ITurret, ITurretProjectile, TurretMetadata, TurretProjectileMetadata } from '../entities';

export class TurretModel extends abilities.ConstructableModel(abilities.OwnableModel(Model)) {
  newEntity(cfg: {position: Vector, player: Player, built: false}): ITurret {
    return {
      ...newEntity({kind: "turret", position: cfg.position}),
      health: cfg.built ? TurretMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      updateCounter: 0,
    };
  }
}

export class TurretProjectileModel extends ProjectileModel<ITurretProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): ITurretProjectile {
    return this.newProjectileEntity({...cfg, kind: "turretProjectile"});
  }
}
