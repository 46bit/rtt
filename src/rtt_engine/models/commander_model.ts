import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { VehicleModel, newEntity } from '../lib';
import { ICommander, CommanderMetadata } from '../entities';

export class CommanderModel extends VehicleModel<ICommander> {
  newEntity(cfg: {position: Vector, player: Player, built: false}): ICommander {
    return {
      ...this.newVehicle({...cfg, kind: "commander"}),
      energyProvided: 0,
    };
  }
}
