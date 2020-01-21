import { Player } from './player';
import { DirectFireQuadTree, PowerSource } from './unimplemented_stubs';

export class Game {
  public powerSources: readonly PowerSource[];
  public players: readonly Player[];
  public sandbox: boolean;
  public updateCounter: number;
  public winner: string | null;
  public winTime: Date | null;

  constructor(powerSources, players, sandbox = false) {
    this.powerSources = powerSources;
    this.players = players;
    this.sandbox = sandbox;
  }

  public update() {
    this.updateCounter += 1;

    this.updatePlayers(null);

    if (!this.winner) {
      this.updateWinner();
    }
  }

  public updatePlayers(directFireQuadtree: DirectFireQuadTree) {
    this.players.forEach((player) => {
      player.update(this.powerSources, this.players, directFireQuadtree);
    });
  }

  public updateWinner() {
    const undefeatedPlayers = this.players.map((player) => !player.isDefeated());
    switch (undefeatedPlayers.length) {
      case 0:
        this.winner = 'nobody';
        this.winTime = Date.new();
        break;
      case 1:
        this.winner = undefeatedPlayers[0];
        this.winTime = Date.new();
        break;
    }
  }
}
