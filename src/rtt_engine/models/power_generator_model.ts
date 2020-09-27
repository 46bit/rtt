import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import { IPowerSource, IPowerGenerator, PowerGeneratorMetadata } from '../entities';

export class PowerGeneratorModel extends abilities.ConstructableModel(abilities.OwnableModel(Model)) {
  newEntity(cfg: {position: Vector, player: Player, built: false, powerSource: IPowerSource}): IPowerGenerator {
    return {
      ...newEntity({kind: "powerGenerator", position: cfg.position}),
      health: cfg.built ? PowerGeneratorMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      energyProvided: 0,
      powerSource: cfg.powerSource,
      energyOutput: 0,
      upgrading: false,
    };
  }
}
