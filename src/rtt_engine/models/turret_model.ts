import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
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

export class TurretProjectileModel extends abilities.KillableModel(
    abilities.OwnableModel(
      abilities.MovableModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player}): ITurretProjectile {
    return {
      ...newEntity({kind: "turretProjectile", position: cfg.position}),
      health: TurretProjectileMetadata.fullHealth,
      dead: false,
      player: cfg.player,
      velocity: TurretProjectileMetadata.velocity,
      direction: Math.random(),
    };
  }
}
