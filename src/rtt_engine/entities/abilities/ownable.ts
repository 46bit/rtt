import { Player } from '../../player';
import { ComposableConstructor } from '../lib/mixins';

export interface IOwnableConfig {
  player: Player | null;
}

export function Ownable<T extends new(o: any) => any>(base: T) {
  class Ownable extends (base as new(o: any) => {}) {
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
