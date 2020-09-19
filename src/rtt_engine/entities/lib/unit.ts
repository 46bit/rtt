import { Vector, Player } from '../../';
import * as abilities from '../abilities';
import { KindsOfUnitsWithAbility, ISolidEntityMetadata, SolidEntityAbilities, newSolidEntity } from './';

export type UnitUnits = KindsOfUnitsWithAbility<IUnitMetadata>;
export type IUnitMetadata =
  ISolidEntityMetadata
  & abilities.IOrderableMetadata
  & abilities.IConstructableMetadata;
export type UnitAbilities =
  SolidEntityAbilities
  & abilities.IOrderableState
  & abilities.IConstructableState;

export interface IUnitState extends UnitAbilities {
  kind: UnitUnits;
}

export type IUnitStateFields = Omit<IUnitState, "kind">;
export function newUnit<K extends UnitUnits>(kind: K, position: Vector, player: Player | null): IUnitStateFields {
  return {
    ...newSolidEntity(kind, position, player),
    ...abilities.newOrderable(kind),
    ...abilities.newConstructable(kind),
  };
}
