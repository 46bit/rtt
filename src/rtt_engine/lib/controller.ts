import { EntityKinds } from '.';
import { IEntity } from './entity';
import { Vector, Player } from '../';
import * as abilities from '../abilities';
import { BotController, ShotgunTankController } from '../controllers';

// Probably removable if any circular type problems emerge
export type ControllersType = {[K in EntityKinds]: Controller<IEntity & {kind: K}>};

export const Controllers: ControllersType = {
  bot: new BotController(),
  shotgunTank: new ShotgunTankController(),
};

export abstract class Controller<E extends IEntity> {
  abstract updateEntities(entities: E[], ctx: abilities.IEntityUpdateContext): E[];
}
