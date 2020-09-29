import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import { ICommander, CommanderMetadata } from '../entities';

// FIXME: Restructure things so that I can extend VehicleModel with EngineerModel
// Mixins on abstract classes just don't work :(
export class CommanderModel extends abilities.EngineerModel(
    abilities.KillableModel(
      abilities.OwnableModel(
        abilities.PathableModel(Model)))) {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): ICommander {
    this.updateProduction
    return {
      ...newEntity({kind: "commander", position: cfg.position}),
      health: CommanderMetadata.fullHealth,
      dead: false,
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
