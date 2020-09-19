import { Player } from '../../player';
import { IEntityMetadata, IEntityState } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export type OwnableUnits = KindsOfUnitsWithAbility<IOwnableMetadata>;
export interface IOwnableMetadata extends IEntityMetadata { }

export interface IOwnableState extends IEntityState {
  kind: OwnableUnits;
  player: Player | null;
}

export type IOwnableStateFields = Omit<IOwnableState, keyof IEntityState>;
export function newOwnable<K extends OwnableUnits>(kind: K, player: Player | null): IOwnableStateFields {
  return {player};
}

export function captureOwnable<T extends IOwnableState>(value: T, player: Player | null): T {
  value.player = player;
  return value;
}

export function ownableIsOccupied(value: IOwnableState): boolean {
  return (value.player !== null);
}

export function playerOwnsOwnable(value: IOwnableState, player: Player | null): boolean {
  return value.player === player;
}
