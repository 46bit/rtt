import { Player } from './player';
import { PowerSource, DirectFireQuadTree } from './unimplemented_stubs';

export class Game {
  powerSources: Array<PowerSource>;
  players: Array<Player>;
  sandbox: boolean;
  updateCounter: number;
  winner: string | null;
  winTime: Date | null;

  constructor(powerSources, players, sandbox = false) {
    this.powerSources = powerSources;
    this.players = players;
    this.sandbox = sandbox;
  }

  update() {
    this.updateCounter += 1;

    this.updatePlayers(null);

    if (!this.winner) {
      this.updateWinner();
    }
  }

  updatePlayers(directFireQuadtree: DirectFireQuadTree) {
    this.players.forEach((player) => {
      player.update(this.powerSources, this.players, directFireQuadtree);
    });
  }

  updateWinner() {
    const undefeated_players = this.players.map((player) => !player.isDefeated());
    switch (undefeated_players.length) {
      case 0:
        this.winner = "nobody";
        this.winTime = Date.new();
        break;
      case 1:
        this.winner = undefeated_players[0];
        this.winTime = Date.new();
        break;
    }
  }
}
