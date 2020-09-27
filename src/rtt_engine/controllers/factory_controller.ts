import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller } from '../lib';
import { IFactory } from '../entities';

export class FactoryController extends Controller<IFactory> {
  updateEntities(entities: IFactory[], ctx: abilities.IEntityUpdateContext): IFactory[] {
    return entities;
  }
}
