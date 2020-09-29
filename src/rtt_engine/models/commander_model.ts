import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { EngineerModel } from '../abilities/engineer';
import { KillableModel } from '../abilities/killable';
import { OwnableModel } from '../abilities/ownable';
import { PathableModel } from '../abilities/pathable';
import { newEntity } from '../lib';
import { Model } from '../lib/model';
import { ICommander, CommanderMetadata } from '../entities';

// FIXME: Restructure things so that I can extend VehicleModel with EngineerModel
// Mixins on abstract classes just don't work :(
export class CommanderModel extends EngineerModel(
    KillableModel(
      OwnableModel(
        PathableModel(Model)))) {
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
