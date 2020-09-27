import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController } from '../lib';
import { IEngineer } from '../entities';

export class EngineerController extends VehicleController<IEngineer> {
  updateEntities(entities: IEngineer[], ctx: abilities.IEntityUpdateContext): IEngineer[] {
    return entities;
  }
}
