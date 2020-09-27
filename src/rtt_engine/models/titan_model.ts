import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import { ITitan, ITitanProjectile, TitanMetadata, TitanProjectileMetadata, newVehicleTurret } from '../entities';

export class TitanModel extends abilities.ConstructableModel(
    abilities.OwnableModel(
      abilities.PathableModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player, built: false}): ITitan {
    return {
      ...newEntity({kind: "titan", position: cfg.position}),
      health: cfg.built ? TitanMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      destination: null,
      route: null,
      angularVelocity: 0,
      velocity: 0,
      direction: Math.random(),
      updateCounter: 0,
      turret: newVehicleTurret(TitanMetadata.turretInput),
    };
  }
}

export class TitanProjectileModel extends abilities.KillableModel(
    abilities.OwnableModel(
      abilities.MovableModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player}): ITitanProjectile {
    return {
      ...newEntity({kind: "titanProjectile", position: cfg.position}),
      health: TitanProjectileMetadata.fullHealth,
      dead: false,
      player: cfg.player,
      velocity: TitanProjectileMetadata.velocity,
      direction: Math.random(),
    };
  }
}
