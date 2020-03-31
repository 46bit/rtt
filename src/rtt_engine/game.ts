import { Obstruction } from './entities';
import { Player } from './player';

export class Game {
  public players: readonly Player[];
  public sandbox: boolean;
  public updateCounter: number;
  public winner: string | null;
  public winTime: Date | null;
  public obstructions: Obstruction[];

  constructor(players: readonly Player[], obstructions: Obstruction[], sandbox = false) {
    this.players = players;
    this.sandbox = sandbox;
    this.updateCounter = 0;
    this.winner = null;
    this.winTime = null;
    this.obstructions = obstructions;
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
      player.update(this.players.filter((p) => p != player));
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
