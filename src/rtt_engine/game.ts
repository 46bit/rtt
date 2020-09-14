import { PowerSource, Obstruction, IEntityUpdateContext } from './entities';
import { Player } from './player';

export class Game {
  public powerSources: readonly PowerSource[];
  public players: readonly Player[];
  public sandbox: boolean;
  public updateCounter: number;
  public winner: string | null;
  public winTime: Date | null;
  public obstructions: Obstruction[];

  constructor(powerSources: readonly PowerSource[], players: readonly Player[], obstructions: Obstruction[], sandbox = false) {
    this.powerSources = powerSources;
    this.players = players;
    this.sandbox = sandbox;
    this.updateCounter = 0;
    this.winner = null;
    this.winTime = null;
    this.obstructions = obstructions;
  }

  public update(context: IEntityUpdateContext) {
    this.updateCounter += 1;

    this.updatePlayers(context);

    if (!this.winner) {
      this.updateWinner();
    }
  }

  public updatePlayers(context: IEntityUpdateContext) {
    this.players.forEach((player) => {
      player.update(this.powerSources, this.players.filter((p) => p != player), context);
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
}
