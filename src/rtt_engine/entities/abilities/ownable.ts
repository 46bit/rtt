import { Player } from '../../player';
import { IEntity, Entity } from '../lib/entity';
import { ComposableConstructor } from '../lib/mixins';

export interface IOwnableConfig {
  player: Player | null;
}

export interface IOwnable extends IEntity {
  player: Player | null;
  capture(player: Player | null): void;
  isOccupied(): boolean;
  isOwner(player: Player | null): boolean;
}

export function Ownable<T extends new(o: any) => any>(base: T) {
  class Ownable extends (base as new(o: any) => Entity) implements IOwnable {
    public player: Player | null;

    constructor(cfg: IOwnableConfig) {
      super(cfg);
      this.player = cfg.player;
    }

    public capture(player: Player | null) {
      this.player = player;
    }

    public isOccupied() {
      return (this.player !== null);
    }

    public isOwner(player: Player | null) {
      return (this.player === player);
    }
  }

  return Ownable as ComposableConstructor<typeof Ownable, T>;
}
