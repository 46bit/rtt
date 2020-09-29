import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller } from '../lib/controller';
import { IPowerSource } from '../entities';

export class PowerSourceController extends Controller<IPowerSource> {
  updateEntities(entities: IPowerSource[], ctx: abilities.IEntityUpdateContext): IPowerSource[] {
    return entities;
  }
}
