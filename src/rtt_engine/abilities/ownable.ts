import { Player } from '..';
import { IEntity, EntityMetadata, EntitiesWithMetadata, Controller } from '../lib';

export interface IOwnableEntity extends IEntity {
  player: Player;
}

export function captureOwnable<T extends IOwnableEntity>(value: T, player: Player): T {
  value.player = player;
  return value;
}

export function playerOwnsOwnable(value: IOwnableEntity, player: Player): boolean {
  return value.player === player;
}
