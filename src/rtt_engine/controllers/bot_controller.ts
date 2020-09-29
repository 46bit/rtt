import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController } from '../lib/vehicle';
import { IBot } from '../entities';

export class BotController extends VehicleController<IBot> {
  updateEntities(entities: IBot[], ctx: abilities.IEntityUpdateContext): IBot[] {
    return entities;
  }
}
