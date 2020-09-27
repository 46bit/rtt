import { Player } from '..';
import { ComposableConstructor, IEntity, Model } from '../lib';

export interface IOwnableEntity extends IEntity {
  player: Player;
}

export function OwnableModel<E extends IOwnableEntity, T extends new(o: any) => any>(base: T) {
  class Ownable extends (base as new(o: any) => Model<E>) {
    captureOwnable(entity: E, player: Player): E {
      entity.player = player;
      return entity;
    }

    playerOwnsOwnable(entity: E, player: Player): boolean {
      return entity.player === player;
    }
  }

  return Ownable as ComposableConstructor<typeof Ownable, T>;
}
