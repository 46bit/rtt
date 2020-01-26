import {
  Collidable,
  Constructable,
  ICollidableConfig,
  IConstructableConfig,
  IOwnableConfig,
  IPresentableConfig,
  Ownable,
  Presentable,
} from '../abilities';
import { Entity, IEntityConfig } from './entity';

export interface IStructureConfig extends ICollidableConfig, IConstructableConfig, IOwnableConfig, IEntityConfig, IPresentableConfig {}

export class Structure extends Collidable(Constructable(Ownable(Presentable(Entity)))) {}
