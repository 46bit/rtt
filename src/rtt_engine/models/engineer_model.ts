import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { EngineerModel } from '../abilities/engineer';
import { ConstructableModel } from '../abilities/constructable';
import { OwnableModel } from '../abilities/ownable';
import { PathableModel } from '../abilities/pathable';
import { newEntity } from '../lib';
import { Model } from '../lib/model';
import { IEngineer, EngineerMetadata } from '../entities';

export class BEngineerModel extends EngineerModel(
    ConstructableModel(
      OwnableModel(
        PathableModel(Model)))) {
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
