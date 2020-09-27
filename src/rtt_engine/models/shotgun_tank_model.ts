import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, ProjectileModel, newEntity } from '../lib';
import {
  IShotgunTank,
  IShotgunTankProjectile,
  ShotgunTankMetadata,
  ShotgunTankProjectileMetadata,
  newVehicleTurret,
} from '../entities';

export class ShotgunTankModel extends abilities.ConstructableModel(
    abilities.OwnableModel(
      abilities.PathableModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player, built: false}): IShotgunTank {
    return {
      ...newEntity({kind: "shotgunTank", position: cfg.position}),
      health: cfg.built ? ShotgunTankMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      destination: null,
      route: null,
      angularVelocity: 0,
      velocity: 0,
      direction: Math.random(),
      updateCounter: 0,
      turret: newVehicleTurret(ShotgunTankMetadata.turretInput),
    };
  }
}

export class ShotgunTankProjectileModel extends ProjectileModel<IShotgunTankProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): IShotgunTankProjectile {
    return this.newProjectileEntity({...cfg, kind: "shotgunTankProjectile"});
  }
}
