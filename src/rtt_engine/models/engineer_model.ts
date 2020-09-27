import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableVehicleModel, newEntity } from '../lib';
import { IEngineer, EngineerMetadata } from '../entities';

export class EngineerModel extends ConstructableVehicleModel<IEngineer> {
  newEntity(cfg: {position: Vector, player: Player, built: false}): IEngineer {
    return {
      ...this.newConstructableVehicle({...cfg, kind: "engineer"}),
      energyProvided: 0,
    };
  }
}
