import {
  IConstructable,
  IConstructableConfig,
  newConstructable,
  IOrderable,
  IOrderableConfig,
  newOrderable,
  IOwnable,
  IOwnableConfig,
  newOwnable,
} from '../abilities';
import { ISolidEntityConfig, ISolidEntity, newSolidEntity } from './solid_entity';

export type IUnitConfig = ISolidEntityConfig & IConstructableConfig & IOrderableConfig & IOwnableConfig;

export type IUnit = ISolidEntity & IConstructable & IOrderable & IOwnable;

export function newUnit(cfg: IUnitConfig): IUnit {
  return newOwnable(newOrderable(newConstructable(newSolidEntity(cfg), cfg), cfg), cfg);
}
