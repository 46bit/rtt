import { IEntity } from '.';
import { Vector, Player } from '..';
import { Pathfinder } from '../abilities';
import { BotController, ShotgunTankController } from '../controllers';

export type Models = never;// = BotController | ShotgunTankController;

export type ModelNames = Models["kind"];

export abstract class Model<E extends IEntity> {
  constructor(o: {}) { }

  abstract newEntity(position: Vector, player: Player): E;
}
