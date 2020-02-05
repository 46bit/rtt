import {
  Constructable,
  IConstructableConfig,
  Orderable,
  IOrderableConfig,
  Ownable,
  IOwnableConfig,
} from '../abilities';
import { SolidEntity, ISolidEntityConfig } from './solid_entity';

export interface IUnitConfig extends ISolidEntityConfig, IConstructableConfig, IOrderableConfig, IOwnableConfig { }

export class Unit extends Constructable(Orderable(Ownable(SolidEntity))) { }
