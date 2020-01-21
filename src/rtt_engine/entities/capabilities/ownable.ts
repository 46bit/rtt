import { Player } from '../../player';

export interface IOwnableConfig {
  player: Player | null;
}

export function Ownable<T extends new(o: any) => any>(Base: T) {
  class Ownable extends (Base as new(o: any) => {}) {
    player: Player | null;

    constructor(cfg: IOwnableConfig) {
      super(cfg);
      this.player = cfg.player;
    }

    capture(player: Player | null) {
      this.player = player;
    }

    isOccupied() {
      return (this.player !== null);
    }

    isOwner(player: Player | null) {
      return (this.player == player);
    }
  }

  return Ownable as ComposableConstructor<typeof Ownable, T>
}
