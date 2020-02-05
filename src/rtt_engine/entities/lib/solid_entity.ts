import {
  Collidable,
  ICollidableConfig,
  Killable,
  IKillableConfig,
} from '../abilities';
import { Entity } from './entity';

export interface ISolidEntityConfig extends ICollidableConfig, IKillableConfig { }

export class SolidEntity extends Collidable(Killable(Entity)) { }
