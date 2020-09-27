import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import {
  IArtilleryTank,
  IArtilleryTankProjectile,
  ArtilleryTankMetadata,
  ArtilleryTankProjectileMetadata,
} from '../entities';

export class ArtilleryTankModel extends abilities.ConstructableModel(
    abilities.OwnableModel(
      abilities.PathableModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player, built: false}): IArtilleryTank {
    return {
      ...newEntity({kind: "artilleryTank", position: cfg.position}),
      health: cfg.built ? ArtilleryTankMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      destination: null,
      route: null,
      angularVelocity: 0,
      velocity: 0,
      direction: Math.random(),
      updateCounter: 0,
    };
  }
}

export class ArtilleryTankProjectileModel extends abilities.KillableModel(
    abilities.OwnableModel(
      abilities.MovableModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player}): IArtilleryTankProjectile {
    return {
      ...newEntity({kind: "artilleryTankProjectile", position: cfg.position}),
      health: ArtilleryTankProjectileMetadata.fullHealth,
      dead: false,
      player: cfg.player,
      velocity: ArtilleryTankProjectileMetadata.velocity,
      direction: Math.random(),
    };
  }
}
