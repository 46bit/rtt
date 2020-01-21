import { IEntityConfig, Entity } from './entity';
import {
  ICollidableConfig,
  Collidable,
  IConstructableConfig,
  Constructable,
  IOwnableConfig,
  Ownable,
} from '../capabilities';

export interface IStructureConfig extends ICollidableConfig, IConstructableConfig, IOwnableConfig, IEntityConfig {}

export class Structure extends Collidable(Constructable(Ownable(Entity))) {}
