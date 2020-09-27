import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
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

export class ShotgunTankProjectileModel extends abilities.KillableModel(
    abilities.OwnableModel(
      abilities.MovableModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player}): IShotgunTankProjectile {
    return {
      ...newEntity({kind: "shotgunTankProjectile", position: cfg.position}),
      health: ShotgunTankProjectileMetadata.fullHealth,
      dead: false,
      player: cfg.player,
      velocity: ShotgunTankProjectileMetadata.velocity,
      direction: Math.random(),
    };
  }
}