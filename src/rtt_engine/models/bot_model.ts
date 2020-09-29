import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { newEntity } from '../lib';
import { ConstructableVehicleModel } from '../lib/vehicle';
import { IBot, BotMetadata } from '../entities';

export class BotModel extends ConstructableVehicleModel<IBot> {
  newEntity(cfg: {position: Vector, player: Player, built: boolean}): IBot {
    return this.newConstructableVehicle({...cfg, kind: "bot"});
  }
}
