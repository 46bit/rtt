import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, ProjectileModel, newEntity } from '../lib';
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
      orders: [],
    };
  }
}

export class ArtilleryTankProjectileModel extends ProjectileModel<IArtilleryTankProjectile> {
  newEntity(cfg: {position: Vector, direction: number, player: Player}): IArtilleryTankProjectile {
    return this.newProjectileEntity({...cfg, kind: "artilleryTankProjectile"});
  }
}
