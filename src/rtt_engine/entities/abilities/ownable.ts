import { Player } from '../../player';
import { IEntityConfig, IEntity } from '../lib/entity';

export interface IOwnableConfig extends IEntityConfig {
  player: Player | null;
}

export interface IOwnable extends IEntity {
  player: Player | null;
}

export function newOwnable<E extends IEntity>(value: E, cfg: IOwnableConfig): E & IOwnable {
  return { ...value, player: cfg.player };
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
