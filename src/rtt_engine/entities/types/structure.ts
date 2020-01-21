import {
  Collidable,
  Constructable,
  ICollidableConfig,
  IConstructableConfig,
  IOwnableConfig,
  Ownable,
} from '../capabilities';
import { Entity, IEntityConfig } from './entity';

export interface IStructureConfig extends ICollidableConfig, IConstructableConfig, IOwnableConfig, IEntityConfig {}

export class Structure extends Collidable(Constructable(Ownable(Entity))) {}
