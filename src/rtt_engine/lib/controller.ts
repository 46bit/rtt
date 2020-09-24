import { IEntity } from './entity';
import { Vector, Player } from '../';
import { Pathfinder } from '../abilities';
import { BotController, ShotgunTankController } from '../controllers';

export type Controllers = BotController | ShotgunTankController;

export type ControllerNames = Controllers["kind"];

export abstract class Controller<E extends IEntity> {
  abstract kind: E["kind"];

  abstract newEntity(position: Vector, player: Player): E;
  abstract updateEntities(entities: E[], pathfinder: Pathfinder): E[];
}
