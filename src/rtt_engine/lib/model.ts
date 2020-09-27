import { IEntity } from '.';
import { Vector, Player } from '..';
import { Pathfinder } from '../abilities';
import { ArtilleryTankModel, BotModel, ShotgunTankModel } from '../models';

export const Models = {
  artilleryTank: new ArtilleryTankModel({}),
  bot: new BotModel({}),
  shotgunTank: new ShotgunTankModel({}),
};
export type ModelsType = typeof Models;

// Cannot be abstract because it gets passed through the ability mixins
// That could be 'fixed' using `any` but the abstract constraint then disappears
export class Model<E extends IEntity> {
  constructor(o: {}) { }

  newEntity(cfg: {position: Vector, player: Player}): E {
    throw Error("unimplemented");
  }
}
