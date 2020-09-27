import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller } from '../lib';
import { IPowerGenerator } from '../entities';

export class PowerGeneratorController extends Controller<IPowerGenerator> {
  updateEntities(entities: IPowerGenerator[], ctx: abilities.IEntityUpdateContext): IPowerGenerator[] {
    return entities;
  }
}
