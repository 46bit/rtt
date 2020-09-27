import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, ProjectileModel, newEntity } from '../lib';
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

export class TitanProjectileModel extends ProjectileModel<ITitanProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): ITitanProjectile {
    return this.newProjectileEntity({...cfg, kind: "titanProjectile"});
  }
}
