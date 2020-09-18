import { Player } from '../../player';
import { IEntity } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export interface IOwnableConfig {
  player: Player | null;
}

export type KindsOfUnitsThatAreOwnable = KindsOfUnitsWithAbility<IOwnableConfig>;

export interface IOwnable extends IEntity<KindsOfUnitsThatAreOwnable> {
  player: Player | null;
}

export type FieldsOfIOwnable = Omit<IOwnable, "kind">;

export function newOwnable<K extends KindsOfUnitsThatAreOwnable, E extends IEntity<K>>(value: E, player: Player | null): E & FieldsOfIOwnable {
  return {...value, player};
}

export function captureOwnable<E extends IOwnable>(value: E, player: Player | null): E {
  value.player = player;
  return value;
}

export function ownableIsOccupied(value: IOwnable): boolean {
  return (value.player !== null);
}

export function playerOwnsOwnable(value: IOwnable, player: Player | null): boolean {
  return value.player === player;
}
