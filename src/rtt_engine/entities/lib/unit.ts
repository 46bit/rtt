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

export interface IUnitState extends UnitAbilities { }

function newUnit(kind: UnitUnits, position: Vector, player: Player | null): IUnitState {
  return {
    ...newSolidEntity(kind, position, player),
    ...abilities.newOrderable(kind),
    ...abilities.newConstructable(kind),
  };
}
