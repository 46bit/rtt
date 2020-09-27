import { Controller } from '../lib';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { IBot, BotMetadata } from '../entities';

export class BotController extends Controller<IBot> {
  updateEntities(bots: IBot[], ctx: abilities.IEntityUpdateContext): IBot[] {
    return bots;
  }
}
