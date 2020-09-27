import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import { IShotgunTank, ShotgunTankMetadata, newVehicleTurret } from '../entities';

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
