import { Player } from './player';
import { PowerSource } from './entities';

export class Game {
  public powerSources: readonly PowerSource[];
  public players: readonly Player[];
  public sandbox: boolean;
  public updateCounter: number;
  public winner: string | null;
  public winTime: Date | null;

  constructor(powerSources: PowerSource[], players: Player[], sandbox = false) {
    this.powerSources = powerSources;
    this.players = players;
    this.sandbox = sandbox;
    this.updateCounter = 0;
    this.winner = null;
    this.winTime = null;
  }

  public update() {
    this.updateCounter += 1;

    this.updatePlayers();

    if (!this.winner) {
      this.updateWinner();
    }
  }

  public updatePlayers() {
    this.players.forEach((player) => {
      player.update(this.powerSources, this.players);
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
