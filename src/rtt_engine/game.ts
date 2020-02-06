import { PowerSource } from './entities';
import { Player } from './player';

export class Game {
  public powerSources: readonly PowerSource[];
  public players: readonly Player[];
  public sandbox: boolean;
  public updateCounter: number;
  public winner: string | null;
  public winTime: Date | null;

  constructor(powerSources: readonly PowerSource[], players: readonly Player[], sandbox = false) {
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
      player.update(this.powerSources, this.players.filter((p) => p != player));
    });
  }

  public updateWinner() {
    const undefeatedPlayers = this.players.filter((player) => !player.isDefeated());
    switch (undefeatedPlayers.length) {
      case 0:
        this.winner = 'nobody';
        this.winTime = new Date();
        break;
      case 1:
        this.winner = undefeatedPlayers[0].name;
        this.winTime = new Date();
        break;
    }
  }

  public draw() {
    for (let player of this.players) {
      player.draw();
    }
  }
}
