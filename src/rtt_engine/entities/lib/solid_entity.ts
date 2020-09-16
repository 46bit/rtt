import {
  ICollidableConfig,
  ICollidable,
  newCollidable,
  IKillableConfig,
  IKillable,
  newKillable,
} from '../abilities';
import { IEntityConfig, IEntity, newEntity } from './entity';

export type ISolidEntityConfig = IEntityConfig & ICollidableConfig & IKillableConfig;

export type ISolidEntity = ICollidable & IKillable;

export function newSolidEntity(cfg: ISolidEntityConfig): ISolidEntity {
  return newCollidable(newKillable(newEntity(cfg), cfg), cfg);
}
