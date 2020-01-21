export class Ownable {
  player: Player | null;

  constructOwnable(player) {
    this.player = player;
  }

  capture(player) {
    this.player = player;
  }

  isOccupied() {
    return (this.player !== null)
  }

  isOwner(player)
    return (this.player == player);
  }
}
