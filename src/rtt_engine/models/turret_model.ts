import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { OwnableModel } from '../abilities/ownable';
import { ConstructableModel } from '../abilities/constructable';
import { newEntity } from '../lib';
import { Model } from '../lib/model';
import { ProjectileModel } from '../lib/projectile';
import { ITurret, ITurretProjectile, TurretMetadata, TurretProjectileMetadata } from '../entities';

export class TurretModel extends ConstructableModel(OwnableModel(Model)) {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): ITurret {
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
