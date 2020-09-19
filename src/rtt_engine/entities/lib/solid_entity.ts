import { Vector, Player } from '../../';
import * as abilities from '../abilities';
import { KindsOfUnitsWithAbility, IEntityMetadata, IEntityState, newEntity } from './';

export type SolidEntityUnits = KindsOfUnitsWithAbility<ISolidEntityMetadata>;
export type ISolidEntityMetadata =
  IEntityMetadata
  & abilities.IOwnableMetadata
  & abilities.IKillableMetadata
  & abilities.ICollidableMetadata;
export type SolidEntityAbilities =
  IEntityState
  & abilities.IOwnableState
  & abilities.IKillableState
  & abilities.ICollidableState;

export interface ISolidEntityState extends SolidEntityAbilities { }

export function newSolidEntity(kind: SolidEntityUnits, position: Vector, player: Player | null): ISolidEntityState {
  return {
    ...newEntity({kind: kind, position}),
    ...abilities.newOwnable(kind, player),
    ...abilities.newKillable(kind),
  };
}
