import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import { ICommander, CommanderMetadata } from '../entities';

export class CommanderModel extends abilities.KillableModel(
    abilities.OwnableModel(
      abilities.EngineerModel(
        abilities.PathableModel(Model)))) {
  newEntity(cfg: {position: Vector, player: Player, built: false}): ICommander {
    return {
      ...newEntity({kind: "commander", position: cfg.position}),
      health: cfg.built ? CommanderMetadata.fullHealth : 0,
      dead: false,
      player: cfg.player,
      destination: null,
      route: null,
      angularVelocity: 0,
      velocity: 0,
      direction: Math.random(),
      energyProvided: 0,
    };
  }
}
