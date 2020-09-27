import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import { IEngineer, EngineerMetadata } from '../entities';

export class EngineerModel extends abilities.EngineerModel(
    abilities.ConstructableModel(
      abilities.OwnableModel(
        abilities.PathableModel(Model)))) {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): IEngineer {
    return {
      ...newEntity({kind: "engineer", position: cfg.position}),
      health: cfg.built ? EngineerMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      destination: null,
      route: null,
      angularVelocity: 0,
      velocity: 0,
      direction: Math.random(),
      orders: [],
      energyProvided: 0,
    };
  }
}
