import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { ConstructableVehicleModel, newEntity } from '../lib';
import { IBot, BotMetadata } from '../entities';

export class BotModel extends ConstructableVehicleModel<IBot> {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): IBot {
    return this.newConstructableVehicle({...cfg, kind: "bot"});
  }
}
