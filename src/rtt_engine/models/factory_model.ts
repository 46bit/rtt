import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableModel } from '../abilities/constructable';
import { OwnableModel } from '../abilities/ownable';
import { EngineerModel } from '../abilities/engineer';
import { Model, newEntity } from '../lib';
import { IFactory, FactoryMetadata } from '../entities';

export class FactoryModel extends ConstructableModel(
    OwnableModel(
      EngineerModel(Model))) {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): IFactory {
    return {
      ...newEntity({kind: "factory", position: cfg.position}),
      health: cfg.built ? FactoryMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      energyProvided: 0,
      orders: [],
    };
  }
}
