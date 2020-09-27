import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController } from '../lib';
import { ICommander } from '../entities';

export class CommanderController extends VehicleController<ICommander> {
  updateEntities(entities: ICommander[], ctx: abilities.IEntityUpdateContext): ICommander[] {
    return entities;
  }
}
